import { Readable } from 'stream';
import { VIDEO_TMP_PREFIX, VIDEO_PUBLIC_PREFIX } from "@/lib/videoJobs";
import { generatePublicUrl } from "@/lib/publicUrlUtils";

export const maxDuration = 60;

// Streams one of our own video files as a download. The browser ignores the download
// attribute on cross-origin links, so videos are served through this route instead.
// Only files under the video prefixes of our own bucket can be requested.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, filename } = req.query;
  const allowedBases = [VIDEO_TMP_PREFIX, VIDEO_PUBLIC_PREFIX].map((prefix) => generatePublicUrl(prefix));
  if (typeof url !== 'string' || !allowedBases.some((base) => url.startsWith(base)) || url.includes('..')) {
    return res.status(400).json({ error: 'Not a video from this site' });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return res.status(upstream.status === 404 ? 404 : 502).json({ error: 'Video is no longer available' });
    }

    const safeName = String(filename || 'picfix-video.mp4').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName.endsWith('.mp4') ? safeName : `${safeName}.mp4`}"`);
    const length = upstream.headers.get('content-length');
    if (length) res.setHeader('Content-Length', length);

    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    console.error('Video download failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download video' });
    }
  }
}
