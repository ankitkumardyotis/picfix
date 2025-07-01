import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "@/lib/prisma";

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Reuse the existing generateSignedUrl function pattern
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
        const { model, page = 1, limit = 20, sortBy = 'createdAt' } = req.body;

        if (!model) {
            return res.status(400).json({ error: 'Model type is required' });
        }

        console.log('Fetching community images for model:', model);

        // Fetch community images from database (paths only)
        const communityImages = await prisma.publishedImage.findMany({
            where: {
                model: model,
                isPublic: true,
                isApproved: true
            },
            orderBy: { [sortBy]: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit),
            include: {
                user: {
                    select: { name: true, image: true }
                }
            }
        });

        console.log(`Found ${communityImages.length} community images for model: ${model}`);

        // Generate signed URLs for all images (following the existing pattern)
        const imagePromises = communityImages.map(async (dbImage, idx) => {
            const height = [300, 250, 275, 225, 325, 250, 300, 275, 250, 325, 250, 300];
            
            try {
                // Generate signed URL for output image
                const outputUrl = await generateSignedUrl(dbImage.outputImagePath);
                
                // Generate signed URLs for input images
                const inputUrls = [];
                for (const inputImg of dbImage.inputImagePaths) {
                    if (inputImg.path) {
                        try {
                            const inputUrl = await generateSignedUrl(inputImg.path);
                            inputUrls.push({
                                ...inputImg,
                                url: inputUrl
                            });
                        } catch (error) {
                            console.error(`Error generating URL for input image ${inputImg.path}:`, error);
                        }
                    }
                }
                
                return {
                    id: `community-${dbImage.id}`,
                    url: outputUrl,
                    outputUrl: outputUrl,
                    inputUrls: inputUrls,
                    inputUrl: inputUrls[0]?.url || null, // For backward compatibility
                    title: dbImage.title,
                    prompt: dbImage.prompt,
                    height: height[idx % height.length],
                    isCommunity: true,
                    author: dbImage.user?.name,
                    authorImage: dbImage.user?.image,
                    likes: dbImage.likes,
                    downloads: dbImage.downloads,
                    views: dbImage.views,
                    hasComparison: inputUrls.length > 0,
                    modelParams: dbImage.modelParams,
                    aspectRatio: dbImage.aspectRatio,
                    createdAt: dbImage.createdAt,
                    publishedImageId: dbImage.id
                };
            } catch (error) {
                console.error(`Error processing community image ${dbImage.id}:`, error);
                return null; // Skip this image if URL generation fails
            }
        });

        const processedImages = await Promise.all(imagePromises);
        
        // Filter out any null images (failed to process)
        const validImages = processedImages.filter(img => img !== null);
        
        res.status(200).json({
            success: true,
            images: validImages,
            total: communityImages.length,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Error getting community images:', error);
        res.status(500).json({
            error: 'Failed to get community images',
            details: error.message
        });
    }
} 