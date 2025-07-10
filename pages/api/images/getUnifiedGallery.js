import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { getUseCaseImageUrl } from "@/constant/getUseCaseImageUrl";
import { generatePublicUrl, getModelDisplayName as getModelName } from "@/lib/publicUrlUtils";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

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

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        
        // Get total count for community images
        const totalCommunityImages = await prisma.publishedImage.count({
            where: {
                isPublic: true,
                isApproved: true
            }
        });

        // 1. Fetch community images with pagination
        const communityImages = await prisma.publishedImage.findMany({
            where: {
                isPublic: true,
                isApproved: true
            },
            orderBy: { [sortBy]: 'desc' },
            skip: Math.floor(skip / 2), // Split pagination between community and examples
            take: Math.ceil(take / 2), // Take half the limit for community images
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

        // 3. Sort example images by likes (descending) and apply pagination
        allExampleImages.sort((a, b) => b.likes - a.likes);
        const totalExampleImages = allExampleImages.length;
        const exampleSkip = Math.ceil(skip / 2);
        const exampleTake = Math.floor(take / 2);
        const selectedExampleImages = allExampleImages.slice(exampleSkip, exampleSkip + exampleTake);

        // 4. Process community images with public URLs (instant loading)
        const processedCommunityImages = communityImages.map((dbImage, idx) => {
            const height = [300, 250, 275, 225, 325, 250, 300, 275, 250, 325];
            
            try {
                // Generate public URL for output image (instant, no API calls)
                const outputUrl = generatePublicUrl(dbImage.outputImagePath);
                
                // Generate public URLs for input images
                const inputUrls = [];
                for (const inputImg of dbImage.inputImagePaths) {
                    if (inputImg.path) {
                        const inputUrl = generatePublicUrl(inputImg.path);
                        if (inputUrl) {
                            inputUrls.push({
                                ...inputImg,
                                url: inputUrl
                            });
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
        });

        // 5. Process example images with public URLs (instant loading)
        console.log(`Processing ${selectedExampleImages.length} selected example images`);
        const processedExampleImages = selectedExampleImages.map((exampleImg, idx) => {
            try {
                const height = [280, 260, 290, 240, 310, 270, 320, 250, 300, 330];
                const model = exampleImg.model;
                const imageData = exampleImg.imageData;
                
                console.log(`Processing example image ${idx + 1}: ${model}/${imageData.outputImage}`);
                
                // Generate public URLs for example images (instant, no API calls)
                const outputUrl = generatePublicUrl(`picfix-usecase-image/${model}/${imageData.outputImage}`);
                
                let inputUrl = null;
                if (imageData.imagePath) {
                    inputUrl = generatePublicUrl(`picfix-usecase-image/${model}/${imageData.imagePath}`);
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
                    title: `${getModelName(model)} Example`,
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
        });
         
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
        
        // Calculate totals and pagination info
        const grandTotal = totalCommunityImages + totalExampleImages;
        const currentTotal = skip + allImages.length;
        const hasMore = currentTotal < grandTotal;
        
        console.log(`Unified gallery response (page ${page}): ${validCommunityCount} community + ${validExampleCount} example = ${allImages.length} images, hasMore: ${hasMore}`);

        res.status(200).json({
            success: true,
            images: allImages,
            total: grandTotal,
            currentCount: allImages.length,
            communityCount: validCommunityCount,
            exampleCount: validExampleCount,
            totalCommunityCount: totalCommunityImages,
            totalExampleCount: totalExampleImages,
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: hasMore
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