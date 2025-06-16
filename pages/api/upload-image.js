import { uploadFileToR2 } from './s3bucket/uploadFile';

// Increase body size limit for image uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, fileName = 'image.jpg' } = req.body;

    console.log('Upload request received:', { fileName, hasImageData: !!imageData });

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Remove the data:image/...;base64, prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('Image buffer created, size:', imageBuffer.length);
    
    // Determine content type from original data URL or default to jpeg
    let contentType = 'image/jpeg';
    if (imageData.startsWith('data:image/png')) {
      contentType = 'image/png';
    } else if (imageData.startsWith('data:image/webp')) {
      contentType = 'image/webp';
    }

    console.log('Content type determined:', contentType);

    // Upload to R2
    const result = await uploadFileToR2(imageBuffer, fileName, contentType);

    console.log('Upload successful:', result);

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
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
} 