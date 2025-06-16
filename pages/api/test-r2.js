export default async function handler(req, res) {
  try {
    // Check if all required environment variables are set
    const requiredEnvVars = [
      'R2_ENDPOINT',
      'R2_ACCESS_KEY_ID', 
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return res.status(500).json({
        error: 'Missing environment variables',
        missing: missingVars
      });
    }

    // Test basic configuration
    const config = {
      endpoint: process.env.R2_ENDPOINT,
      bucket: process.env.R2_BUCKET_NAME,
      hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY
    };

    res.status(200).json({
      success: true,
      message: 'R2 configuration appears to be set up',
      config
    });

  } catch (error) {
    console.error('R2 test error:', error);
    res.status(500).json({
      error: 'R2 test failed',
      details: error.message
    });
  }
} 