const PUBLIC_BUCKET_URL = process.env.PUBLIC_BUCKET_URL || 'https://dev-photos.picfix.ai';

function generatePublicUrl(imagePath) {``
    return `${PUBLIC_BUCKET_URL}/${imagePath}`;
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

        // Generate public URLs for all images (will be processed by proxy if needed)
        const imagePromises = imagesPath.useCaseImages.map((element, idx) => {
            const height = [300, 250, 275, 225, 325, 250, 300, 275, 250, 325, 250, 300]
            const imagePath = element.outputImage || element.path || element;
            const url = generatePublicUrl(`picfix-usecase-image/${imagesPath.model}/${imagePath}`);
            
            // Generate URLs for both input and output images for comparison
            let inputUrl = null;
            let outputUrl = null;
            
            if (element.imagePath) {
                inputUrl = generatePublicUrl(`picfix-usecase-image/${imagesPath.model}/${element.imagePath}`);
            }
            
            if (element.outputImage) {
                console.log("outputImage", `picfix-usecase-image/${imagesPath.model}/${element.outputImage}`);
                outputUrl = generatePublicUrl(`picfix-usecase-image/${imagesPath.model}/${element.outputImage}`);
            }
            
            return {
                id: element.id || null,
                url: url, 
                outputUrl: outputUrl, 
                inputUrl: inputUrl,
                prompt: imagePath,
                height: height[idx] || null,
                imagePath: element.imagePath || null, 
                outputImage: element.outputImage || null, 
                hasComparison: !!(element.imagePath && element.outputImage)
            };
        });

        const exampleImages = imagePromises;
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