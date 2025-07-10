export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, filename } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Fetch the image from the provided URL
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Set headers to force download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'image.jpg'}"`);
    res.setHeader('Content-Length', imageBuffer.byteLength);
    
    // Send the image buffer
    res.send(Buffer.from(imageBuffer));
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download image' });
  }
} 