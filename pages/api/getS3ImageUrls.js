import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

async function generateSignedUrl(imagePath) {
    try {
        const getUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: imagePath,
            }),
            { expiresIn: 3600 } // 1 hour
        );
        return getUrl;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imagesPath } = req.body;

        if (!imagesPath || !imagesPath.useCaseImages) {
            return res.status(400).json({ error: 'Invalid images path data' });
        }

        // Generate signed URLs for all images
        const imagePromises = imagesPath.useCaseImages.map(async (element, idx) => {
            const height = [300, 250, 275, 225, 325, 250, 300, 275, 250, 325, 250, 300]
            const imagePath = element.outputImage || element.path || element;
            const url = await generateSignedUrl(`picfix-usecase-image/${imagesPath.model}/${imagePath}`);
            
            // Generate URLs for both input and output images for comparison
            let inputUrl = null;
            let outputUrl = null;
            
            if (element.imagePath) {
                inputUrl = await generateSignedUrl(`picfix-usecase-image/${imagesPath.model}/${element.imagePath}`);
            }
            
            if (element.outputImage) {
                console.log("outputImage", `picfix-usecase-image/${imagesPath.model}/${element.outputImage}`);
                outputUrl = await generateSignedUrl(`picfix-usecase-image/${imagesPath.model}/${element.outputImage}`);
            }
            
            return {
                id: element.id || null,
                url: url, // Main display URL (output image)
                outputUrl: outputUrl, // Actual output image URL for comparison
                inputUrl: inputUrl, // Input image URL for comparison
                prompt: imagePath,
                height: height[idx] || null,
                imagePath: element.imagePath || null, // Keep the original path
                outputImage: element.outputImage || null, // Keep the original output path
                hasComparison: !!(element.imagePath && element.outputImage)
            };
        });

        const exampleImages = await Promise.all(imagePromises);
        console.log("exampleImages", exampleImages);
        res.status(200).json({
            success: true,
            images: exampleImages
        });

    } catch (error) {
        console.error('Error generating S3 URLs:', error);
        res.status(500).json({
            error: 'Failed to generate image URLs',
            details: error.message
        });
    }
} 