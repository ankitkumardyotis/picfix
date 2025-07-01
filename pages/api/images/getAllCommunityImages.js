import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
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
        const { page = 1, limit = 100, sortBy = 'createdAt' } = req.body;

        // Get user session to check like status
        const session = await getServerSession(req, res, authOptions);
        const currentUserId = session?.user?.id;

        console.log('Fetching all community images from all models');

        // Fetch community images from ALL models in one database query
        const communityImages = await prisma.publishedImage.findMany({
            where: {
                isPublic: true,
                isApproved: true
            },
            orderBy: { [sortBy]: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit),
            include: {
                user: {
                    select: { name: true, image: true }
                },
                imageLikes: currentUserId ? {
                    where: { userId: currentUserId },
                    select: { userId: true }
                } : false
            }
        });

        console.log(`Found ${communityImages.length} total community images from all models`);

        // Generate signed URLs for all images
        const imagePromises = communityImages.map(async (dbImage, idx) => {
            const height = [300, 250, 275, 225, 325, 250, 300, 275, 250, 325, 250, 300];

            try {
                const outputUrl = await generateSignedUrl(dbImage.outputImagePath);
                
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
                    publishedImageId: dbImage.id,
                    model: dbImage.model, // Include model information
                    userLiked: currentUserId ? dbImage.imageLikes.length > 0 : false, // Check if current user liked this image
                    isLoggedIn: !!currentUserId // Whether user is logged in
                };
            } catch (error) {
                console.error(`Error processing community image ${dbImage.id}:`, error);
                return null; // Skip this image if URL generation fails
            }
        });

        const processedImages = await Promise.all(imagePromises);

        const validImages = processedImages.filter(img => img !== null);

        res.status(200).json({
            success: true,
            images: validImages,
            total: communityImages.length,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Error getting all community images:', error);
        res.status(500).json({
            error: 'Failed to get all community images',
            details: error.message
        });
    }
} 