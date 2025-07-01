import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { getUseCaseImageUrl } from "@/constant/getUseCaseImageUrl";

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Generate signed URL for R2 images
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
        const { page = 1, limit = 50, sortBy = 'createdAt' } = req.body;

        // Get user session to check like status
        const session = await getServerSession(req, res, authOptions);
        const currentUserId = session?.user?.id;

        console.log('Fetching unified gallery (community + example images)');

        // 1. Fetch community images
        const communityImages = await prisma.publishedImage.findMany({
            where: {
                isPublic: true,
                isApproved: true
            },
            orderBy: { [sortBy]: 'desc' },
            take: parseInt(limit / 2), // Take half the limit for community images
            include: {
                user: {
                    select: { name: true, image: true }
                },
                imageLikes: currentUserId ? {
                    where: { userId: currentUserId, publishedImageId: { not: null } },
                    select: { userId: true }
                } : false
            }
        });

                 // 2. Fetch example images from all models
         console.log('Processing example images from models:', getUseCaseImageUrl.length);
         const allExampleImages = [];
         
         for (const modelData of getUseCaseImageUrl) {
             const model = modelData.model;
             
             // Skip reimagine model (map to 'reimagine' instead of 're-imagine')
             const modelKey = model === 're-imagine' ? 'reimagine' : model;
             
             console.log(`Processing model: ${model} -> ${modelKey}, images: ${modelData.useCaseImages.length}`);
             
             for (const imageData of modelData.useCaseImages) {
                 const exampleImageId = `${modelKey}::${imageData.outputImage}`;
                 
                 // Get stats for this example image
                 const stats = await prisma.exampleImageStats.findUnique({
                     where: { imageId: exampleImageId }
                 });

                 // Check if user liked this example image
                 let userLiked = false;
                 if (currentUserId) {
                     const userLike = await prisma.imageLike.findFirst({
                         where: {
                             userId: currentUserId,
                             exampleImageId: exampleImageId
                         }
                     });
                     userLiked = !!userLike;
                 }

                 allExampleImages.push({
                     id: `example-${exampleImageId}`,
                     model: modelKey,
                     imageData: imageData,
                     exampleImageId: exampleImageId,
                     likes: stats?.likes || 0,
                     downloads: stats?.downloads || 0,
                     views: stats?.views || 0,
                     userLiked: userLiked,
                     isExample: true,
                     createdAt: stats?.createdAt || new Date('2024-01-01') // Default date for sorting
                 });
             }
         }
         
         console.log(`Total example images collected: ${allExampleImages.length}`);

        // 3. Sort example images by likes (descending) and take portion
        allExampleImages.sort((a, b) => b.likes - a.likes);
        const selectedExampleImages = allExampleImages.slice(0, parseInt(limit / 2));

        // 4. Process community images with signed URLs
        const processedCommunityImages = await Promise.all(
            communityImages.map(async (dbImage, idx) => {
                const height = [300, 250, 275, 225, 325, 250, 300, 275, 250, 325];
                
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
                        title: dbImage.title,
                        prompt: dbImage.prompt,
                        height: height[idx % height.length],
                        isCommunity: true,
                        isExample: false,
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
                        model: dbImage.model,
                        userLiked: currentUserId ? dbImage.imageLikes.length > 0 : false,
                        isLoggedIn: !!currentUserId
                    };
                } catch (error) {
                    console.error(`Error processing community image ${dbImage.id}:`, error);
                    return null;
                }
            })
        );

                 // 5. Process example images with signed URLs
         console.log(`Processing ${selectedExampleImages.length} selected example images`);
         const processedExampleImages = await Promise.all(
             selectedExampleImages.map(async (exampleImg, idx) => {
                 try {
                     const height = [280, 260, 290, 240, 310, 270, 320, 250, 300, 330];
                     const model = exampleImg.model;
                     const imageData = exampleImg.imageData;
                     
                     console.log(`Processing example image ${idx + 1}: ${model}/${imageData.outputImage}`);
                     
                     // Generate signed URLs for example images (correct path structure)
                     const outputUrl = await generateSignedUrl(`picfix-usecase-image/${model}/${imageData.outputImage}`);
                     
                     let inputUrl = null;
                     if (imageData.imagePath) {
                         try {
                             inputUrl = await generateSignedUrl(`picfix-usecase-image/${model}/${imageData.imagePath}`);
                         } catch (error) {
                             console.error(`Error generating input URL for ${imageData.imagePath}:`, error);
                         }
                     }

                     // Create prompt from image name for text-based models
                     let prompt = null;
                     if (['generate-image', 'combine-image'].includes(model)) {
                         prompt = imageData.outputImage.replace(/\.(jpg|png|jpeg)$/i, '');
                     }

                     const processedImage = {
                         id: exampleImg.id,
                         url: outputUrl,
                         outputUrl: outputUrl,
                         inputUrl: inputUrl,
                         title: `${getModelDisplayName(model)} Example`,
                         prompt: prompt,
                         height: height[idx % height.length],
                         isCommunity: false,
                         isExample: true,
                         author: 'PicFix.AI',
                         authorImage: null,
                         likes: exampleImg.likes,
                         downloads: exampleImg.downloads,
                         views: exampleImg.views,
                         hasComparison: !!inputUrl,
                         modelParams: null,
                         aspectRatio: null,
                         createdAt: exampleImg.createdAt,
                         exampleImageId: exampleImg.exampleImageId,
                         model: model,
                         userLiked: exampleImg.userLiked,
                         isLoggedIn: !!currentUserId
                     };
                     
                     console.log(`Successfully processed example image: ${processedImage.id}`);
                     return processedImage;
                 } catch (error) {
                     console.error(`Error processing example image ${idx + 1}:`, error, {
                         model: exampleImg.model,
                         imageData: exampleImg.imageData
                     });
                     return null;
                 }
             })
         );
         
         const validExampleImages = processedExampleImages.filter(img => img !== null);
         console.log(`Successfully processed ${validExampleImages.length} example images`);

        // 6. Combine and shuffle both types
        const allImages = [
            ...processedCommunityImages.filter(img => img !== null),
            ...processedExampleImages.filter(img => img !== null)
        ];

        // Sort by creation date (newest first) but mix community and example images
        allImages.sort((a, b) => {
            // Prioritize community images slightly, then by likes, then by date
            if (a.isCommunity !== b.isCommunity) {
                return a.isCommunity ? -0.1 : 0.1; // Slight preference for community
            }
            if (a.likes !== b.likes) {
                return b.likes - a.likes; // Higher likes first
            }
            return new Date(b.createdAt) - new Date(a.createdAt); // Newer first
        });

        const validCommunityCount = processedCommunityImages.filter(img => img !== null).length;
        const validExampleCount = processedExampleImages.filter(img => img !== null).length;
        
        console.log(`Unified gallery response: ${validCommunityCount} community + ${validExampleCount} example = ${allImages.length} total images`);

        res.status(200).json({
            success: true,
            images: allImages,
            total: allImages.length,
            communityCount: validCommunityCount,
            exampleCount: validExampleCount,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Error getting unified gallery:', error);
        res.status(500).json({
            error: 'Failed to get unified gallery',
            details: error.message
        });
    }
}

// Helper function to get model display name
function getModelDisplayName(model) {
    const modelNames = {
        'generate-image': 'AI Image Generator',
        'hair-style': 'Hair Style Changer',
        'headshot': 'Professional Headshot',
        'cartoonify': 'Cartoonify',
        'restore-image': 'Image Restoration',
        'text-removal': 'Text/Watermark Removal',
        'reimagine': 'ReImagine Scenarios',
        'combine-image': 'Image Combiner'
    };
    return modelNames[model] || model;
} 