import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { finalizePendingVideoJobs, VIDEO_TTL_HOURS } from "@/lib/videoJobs";

export const maxDuration = 60;

// The user's videos from the last VIDEO_TTL_HOURS hours (older files are deleted from
// storage). Also finalizes any job Replicate has finished, so the page works even when
// the webhook cannot reach the server.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Please login to see your videos.' });
  }

  const userId = session.user.id;
  const since = new Date(Date.now() - VIDEO_TTL_HOURS * 60 * 60 * 1000);
  const where = { userId, model: { startsWith: 'video-' }, createdAt: { gt: since } };

  try {
    await finalizePendingVideoJobs(userId);

    const jobs = await prisma.history.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const videos = jobs.map((job) => ({
      id: job.id,
      model: job.model,
      status: job.status === 'finalizing' ? 'processing' : job.status,
      prompt: job.prompt,
      credits: parseInt(job.cost, 10) || 0,
      url: job.status === 'completed' ? job.publicUrl : null,
      error: job.status === 'failed' ? (job.modelParams?.error || 'Generation failed') : null,
      createdAt: job.createdAt,
      expiresAt: new Date(new Date(job.createdAt).getTime() + VIDEO_TTL_HOURS * 60 * 60 * 1000),
    }));

    return res.status(200).json({ videos });
  } catch (error) {
    console.error('Video list failed:', error);
    return res.status(500).json({ error: 'Could not load your videos.' });
  }
}
