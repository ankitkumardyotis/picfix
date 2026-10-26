import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { uploadFileToR2 } from './s3bucket/uploadFile';

// Allow for a base64 payload of MAX_IMAGE_BYTES (base64 is about 4/3 the size)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '34mb',
    },
  },
}

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

// The editor lets visitors upload a photo before they log in (the uploaded URL is
// saved and restored after login), so uploads stay open to anonymous visitors.
// To limit abuse they are rate limited per IP. This limiter lives in memory, so on
// serverless hosting it applies per running instance: it slows abuse, it is not a hard cap.
const ANON_LIMIT = 10;
const ANON_WINDOW_MS = 10 * 60 * 1000;
const anonymousHits = new Map();

function tooManyAnonymousUploads(ip) {
  const now = Date.now();
  const recent = (anonymousHits.get(ip) || []).filter((time) => now - time < ANON_WINDOW_MS);
  if (recent.length >= ANON_LIMIT) {
    anonymousHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  anonymousHits.set(ip, recent);

  if (anonymousHits.size > 5000) {
    for (const [key, times] of anonymousHits) {
      if (times.every((time) => now - time >= ANON_WINDOW_MS)) anonymousHits.delete(key);
    }
  }
  return false;
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (first ? first.split(',')[0].trim() : req.socket?.remoteAddress) || 'unknown';
}

// Identify the image from its actual bytes. The data URL prefix is controlled by the
// sender and is not trusted.
function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { contentType: 'image/jpeg', extension: 'jpg' };
  }
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(pngSignature)) {
    return { contentType: 'image/png', extension: 'png' };
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { contentType: 'image/webp', extension: 'webp' };
  }
  return null;
}

// Keep the name readable but safe to use inside an object key.
function safeBaseName(fileName) {
  const withoutExtension = String(fileName || 'image').replace(/\.[^.\\/]*$/, '');
  const cleaned = withoutExtension.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return cleaned || 'image';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session && tooManyAnonymousUploads(clientIp(req))) {
      return res.status(429).json({ error: 'Too many uploads. Please log in or try again in a few minutes.' });
    }

    const { imageData, fileName } = req.body || {};

    if (typeof imageData !== 'string' || !imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Remove the data:image/...;base64, prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

    if (Math.floor(base64Data.length * 3 / 4) > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'Image is too large. The limit is 25MB.' });
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const detected = detectImageType(imageBuffer);
    if (!detected) {
      return res.status(400).json({ error: 'Only JPG, PNG and WebP images can be uploaded.' });
    }

    const safeName = `${safeBaseName(fileName)}.${detected.extension}`;
    const result = await uploadFileToR2(imageBuffer, safeName, detected.contentType);

    res.status(200).json({
      success: true,
      url: result.url,
      key: result.key
    });
  } catch (error) {
    console.error('Detailed upload error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Failed to upload image' });
  }
}
