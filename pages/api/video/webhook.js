import { finalizeVideoJob, isValidJobSignature } from "@/lib/videoJobs";

// Downloading and storing a finished video can take a while.
export const maxDuration = 60;

// The request body is not used. The job is finalized from Replicate's own record of
// the prediction, so a forged webhook cannot mark a job complete.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, sig } = req.query;
  if (!id || !sig || !isValidJobSignature(String(id), String(sig))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    await finalizeVideoJob(String(id));
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Video webhook failed:', error);
    // A non-2xx response makes Replicate retry while the output file still exists.
    return res.status(500).json({ error: 'Could not finalize video' });
  }
}
