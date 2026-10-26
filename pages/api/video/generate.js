import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import videoModels, { getVideoCredits } from "@/constant/VideoModels";
import { signJobId, refundCredits } from "@/lib/videoJobs";
import { getRequestLocation } from "@/lib/locationUtils";

export const maxDuration = 30;

const MAX_ACTIVE_JOBS = 3;
const MAX_PROMPT_LENGTH = 2000;

function buildReplicateInput(modelKey, { prompt, negativePrompt, duration, resolution, aspectRatio, imageUrl, generateAudio }) {
  // With a first-frame image the output ratio follows the image.
  const ratio = imageUrl ? 'adaptive' : aspectRatio;
  const input = { prompt, duration, resolution, aspect_ratio: ratio };
  if (imageUrl) input.image = imageUrl;

  if (modelKey === 'wan-3' && negativePrompt) {
    input.negative_prompt = negativePrompt;
  }
  if (modelKey === 'seedance-2.5') {
    input.generate_audio = generateAudio;
    input.watermark = false;
  }
  return input;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Please login to use this feature.' });
  }

  const body = req.body || {};
  const modelKey = body.model;
  const model = videoModels[modelKey];
  if (!model) {
    return res.status(400).json({ error: 'Unknown video model.' });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return res.status(400).json({ error: 'Please enter a prompt.' });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.` });
  }

  const duration = Number(body.duration);
  const resolution = body.resolution || model.defaultResolution;
  const aspectRatio = body.aspectRatio || model.defaultAspectRatio;
  if (!model.aspectRatios.includes(aspectRatio)) {
    return res.status(400).json({ error: 'Unsupported aspect ratio.' });
  }

  const imageUrl = typeof body.imageUrl === 'string' && body.imageUrl ? body.imageUrl : null;
  if (imageUrl && !imageUrl.startsWith('https://')) {
    return res.status(400).json({ error: 'Image URL must be https.' });
  }

  // Storage key of the uploaded start photo (from /api/upload-image), kept for the history record
  const imageKey = imageUrl && typeof body.imageKey === 'string' && body.imageKey.startsWith('images/') ? body.imageKey : null;

  // The price is always computed here; nothing price-related is read from the client.
  const credits = getVideoCredits(modelKey, { resolution, duration });
  if (!credits) {
    return res.status(400).json({
      error: `Choose a duration of ${model.minDuration}-${model.maxDuration} seconds and a supported resolution.`,
    });
  }

  const userId = session.user.id;
  const generateAudio = body.generateAudio !== false;

  // Cap concurrent jobs per user so a script cannot run up Replicate spend.
  const active = await prisma.history.count({
    where: { userId, status: { in: ['processing', 'finalizing'] }, model: { startsWith: 'video-' } },
  });
  if (active >= MAX_ACTIVE_JOBS) {
    return res.status(429).json({ error: `You can have ${MAX_ACTIVE_JOBS} videos generating at a time. Please wait for one to finish.` });
  }

  // Take the credits up front, atomically. A refund happens if the job fails.
  const debit = await prisma.plan.updateMany({
    where: {
      userId,
      remainingPoints: { gte: credits },
      OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
    },
    data: { remainingPoints: { decrement: credits } },
  });
  if (debit.count === 0) {
    return res.status(402).json({
      error: 'Insufficient credits',
      message: `This video needs ${credits} credits. Please upgrade your plan or buy more credits.`,
    });
  }

  let job = null;
  try {
    // Same location tracking as the image models (feeds the admin location analytics)
    let locationData = null;
    try {
      locationData = await getRequestLocation(req);
    } catch (locationError) {
      console.error('Error capturing location data:', locationError);
    }

    job = await prisma.history.create({
      data: {
        userId,
        model: model.historyModel,
        status: 'processing',
        cost: String(credits),
        prompt,
        aspectRatio,
        modelParams: { resolution, duration, aspectRatio, generateAudio, imageUrl },
        // The start photo, in the same shape the image models use for their inputs
        inputImagePaths: imageKey ? [{ path: imageKey, type: 'input0', order: 0 }] : [],
        userIP: locationData?.ip || null,
        country: locationData?.country || null,
        region: locationData?.region || null,
        city: locationData?.city || null,
        timezone: locationData?.timezone || null,
        latitude: locationData?.latitude || null,
        longitude: locationData?.longitude || null,
        countryCode: locationData?.countryCode || null,
        isPublished: false,
      },
    });

    const payload = {
      input: buildReplicateInput(modelKey, {
        prompt, negativePrompt: body.negativePrompt, duration, resolution, aspectRatio, imageUrl, generateAudio,
      }),
    };
    // Without a public webhook URL (local dev) the list endpoint finalizes the job when polled.
    if (process.env.REPLICATE_WEBHOOK_URL) {
      payload.webhook = `${process.env.REPLICATE_WEBHOOK_URL}/api/video/webhook?id=${job.id}&sig=${signJobId(job.id)}`;
      payload.webhook_events_filter = ['completed'];
    }

    const response = await fetch(`https://api.replicate.com/v1/models/${model.replicateModel}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const prediction = await response.json();
    if (!response.ok || !prediction.id) {
      throw new Error(prediction.detail || `Replicate rejected the request (${response.status})`);
    }

    await prisma.history.update({ where: { id: job.id }, data: { replicateId: prediction.id } });

    return res.status(200).json({ id: job.id, status: 'processing', credits });
  } catch (error) {
    console.error('Video generation start failed:', error);
    await refundCredits(userId, credits).catch((refundError) => console.error('Refund failed:', refundError));
    if (job) {
      await prisma.history.update({
        where: { id: job.id },
        data: { status: 'failed', modelParams: { resolution, duration, aspectRatio, error: 'Could not start generation' } },
      }).catch(() => {});
    }
    return res.status(500).json({ error: 'Could not start the video. Your credits were not charged.' });
  }
}
