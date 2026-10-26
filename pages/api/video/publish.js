import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { publishVideoFromHistory } from "@/lib/videoJobs";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { historyId, title } = req.body || {};
  if (!historyId) {
    return res.status(400).json({ error: 'History ID is required' });
  }

  try {
    const published = await publishVideoFromHistory(String(historyId), session.user.id, { title: title || null });
    return res.status(200).json({
      success: true,
      publishedImage: { id: published.id, title: published.title, model: published.model, createdAt: published.createdAt },
    });
  } catch (error) {
    const known = {
      'Video not found': [404, 'Video not found in your history'],
      'Video already published': [400, 'This video has already been published'],
      'Video is not ready': [400, 'This video is not ready to publish yet'],
      'Video has expired': [410, 'This video has expired and can no longer be published'],
    }[error.message];
    if (known) {
      return res.status(known[0]).json({ error: known[1] });
    }
    console.error('Video publish failed:', error);
    return res.status(500).json({ error: 'Failed to publish video' });
  }
}
