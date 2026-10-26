// Video job helpers: webhook signing, credit refunds, and finalizing a finished
// Replicate prediction into R2. Replicate deletes API output files after one hour,
// so every finished video is copied to our own bucket under VIDEO_TMP_PREFIX.
// A lifecycle rule on that prefix (scripts/setVideoLifecycle.js) deletes them after
// VIDEO_TTL_HOURS.

import crypto from 'crypto';
import { S3Client, PutObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import prisma from './prisma';
import { generatePublicUrl } from './publicUrlUtils';
import { isVideoModel } from '../constant/VideoModels';

export const VIDEO_TMP_PREFIX = 'video-tmp/';
// Published videos are copied here. The lifecycle rule only covers VIDEO_TMP_PREFIX, so these are never deleted.
export const VIDEO_PUBLIC_PREFIX = 'video-public/';
export const VIDEO_TTL_HOURS = 24;

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const FINALIZING_STALE_MS = 5 * 60 * 1000;
// Replicate removes outputs after an hour; stop retrying shortly before that.
const OUTPUT_GIVE_UP_MS = 50 * 60 * 1000;

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

function jobSecret() {
  return process.env.VIDEO_WEBHOOK_SECRET || process.env.NEXTAUTH_SECRET;
}

export function signJobId(id) {
  return crypto.createHmac('sha256', jobSecret()).update(String(id)).digest('hex');
}

export function isValidJobSignature(id, signature) {
  const expected = Buffer.from(signJobId(id));
  const given = Buffer.from(String(signature));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

export async function refundCredits(userId, credits) {
  if (!credits || credits < 1) return;
  await prisma.plan.update({
    where: { userId },
    data: { remainingPoints: { increment: credits } },
  });
}

async function getPrediction(replicateId) {
  const response = await fetch(`https://api.replicate.com/v1/predictions/${replicateId}`, {
    headers: { Authorization: `Bearer ${process.env.REPLICATE_API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`Replicate prediction lookup failed (${response.status})`);
  }
  return response.json();
}

async function downloadVideo(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Video download failed (${response.status})`);
  }
  const declared = parseInt(response.headers.get('content-length') || '0', 10);
  if (declared > MAX_VIDEO_BYTES) {
    throw new Error('Video is larger than the allowed size');
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_VIDEO_BYTES) {
    throw new Error('Video is larger than the allowed size');
  }
  return buffer;
}

async function failJob(job, reason) {
  await refundCredits(job.userId, parseInt(job.cost, 10));
  return prisma.history.update({
    where: { id: job.id },
    data: { status: 'failed', modelParams: { ...(job.modelParams || {}), error: reason } },
  });
}

// Moves a processing job to its final state if Replicate has finished it.
// Safe to call from the webhook and from polling at the same time: only one caller
// wins the claim below, and credits are refunded at most once.
export async function finalizeVideoJob(historyId) {
  let job = await prisma.history.findUnique({ where: { id: historyId } });
  if (!job || !job.replicateId) return job;

  // A crashed finalizer must not leave the job stuck forever.
  if (job.status === 'finalizing' && Date.now() - new Date(job.updatedAt).getTime() > FINALIZING_STALE_MS) {
    await prisma.history.updateMany({ where: { id: historyId, status: 'finalizing' }, data: { status: 'processing' } });
    job = await prisma.history.findUnique({ where: { id: historyId } });
  }
  if (job.status !== 'processing') return job;

  const prediction = await getPrediction(job.replicateId);
  if (prediction.status === 'starting' || prediction.status === 'processing') return job;

  const claim = await prisma.history.updateMany({
    where: { id: historyId, status: 'processing' },
    data: { status: 'finalizing' },
  });
  if (claim.count === 0) return prisma.history.findUnique({ where: { id: historyId } });

  try {
    if (prediction.status !== 'succeeded') {
      return await failJob(job, prediction.error || `Generation ${prediction.status}`);
    }

    const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (typeof outputUrl !== 'string' || !outputUrl.startsWith('https://')) {
      return await failJob(job, 'No video was returned');
    }

    const buffer = await downloadVideo(outputUrl);
    const key = `${VIDEO_TMP_PREFIX}${job.userId}/${job.id}.mp4`;
    await r2Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'video/mp4',
    }));

    return await prisma.history.update({
      where: { id: historyId },
      data: { status: 'completed', outputImagePath: key, publicUrl: generatePublicUrl(key) },
    });
  } catch (error) {
    const finishedAt = prediction.completed_at ? new Date(prediction.completed_at).getTime() : Date.now();
    if (Date.now() - finishedAt > OUTPUT_GIVE_UP_MS) {
      return failJob(job, 'The video could not be saved before it expired');
    }
    // Let the next webhook retry or poll try again.
    await prisma.history.update({ where: { id: historyId }, data: { status: 'processing' } });
    throw error;
  }
}

// Finalizes any of the user's jobs that Replicate has finished. Called when the user's
// videos are listed, so a job completes even when the webhook cannot reach the server.
export async function finalizePendingVideoJobs(userId, limit = 5) {
  const pending = await prisma.history.findMany({
    where: { userId, model: { startsWith: 'video-' }, status: { in: ['processing', 'finalizing'] } },
    select: { id: true },
    take: limit,
  });
  await Promise.all(pending.map((job) => finalizeVideoJob(job.id).catch((error) => {
    console.error('Video finalize failed:', error);
  })));
}

// Publishes a finished video to the community. Videos in VIDEO_TMP_PREFIX are deleted after
// VIDEO_TTL_HOURS, so the file is copied to VIDEO_PUBLIC_PREFIX first, and the history record
// is pointed at the permanent copy so the video stays in the user's history too.
export async function publishVideoFromHistory(historyId, userId, { title } = {}) {
  const job = await prisma.history.findUnique({ where: { id: historyId }, include: { user: true } });
  if (!job || job.userId !== userId || !isVideoModel(job.model)) {
    throw new Error('Video not found');
  }
  if (job.isPublished) {
    throw new Error('Video already published');
  }
  if (job.status !== 'completed' || !job.outputImagePath || !job.outputImagePath.startsWith(VIDEO_TMP_PREFIX)) {
    throw new Error('Video is not ready');
  }

  const bucket = process.env.R2_BUCKET_NAME;
  const publicKey = `${VIDEO_PUBLIC_PREFIX}${job.userId}/${job.id}.mp4`;
  try {
    await r2Client.send(new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${job.outputImagePath}`,
      Key: publicKey,
      ContentType: 'video/mp4',
      MetadataDirective: 'REPLACE',
    }));
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      throw new Error('Video has expired');
    }
    throw error;
  }

  const publishedImage = await prisma.publishedImage.create({
    data: {
      userId: job.userId,
      userName: job.user?.name,
      userEmail: job.user?.email,
      outputImagePath: publicKey,
      inputImagePaths: job.inputImagePaths || [],
      model: job.model,
      prompt: job.prompt,
      modelParams: job.modelParams,
      aspectRatio: job.aspectRatio,
      title: title || job.prompt || 'AI Video',
      isPublic: true,
      isApproved: true,
      historyId: job.id,
    },
  });

  await prisma.history.update({
    where: { id: job.id },
    data: {
      isPublished: true,
      publishedImageId: publishedImage.id,
      outputImagePath: publicKey,
      publicUrl: generatePublicUrl(publicKey),
    },
  });

  return publishedImage;
}
