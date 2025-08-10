// Unified Image Storage Utility
// Handles storing generated images in history and publishing from history

import { uploadCommunityImage, imageUrlToBuffer, generateSafeFileName } from './communityImageStorage';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from './prisma';

// Configure R2 client for direct uploads
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Upload image directly to R2 bucket with organized history path
async function uploadToR2History(imageBuffer, imagePath) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imagePath,
      Body: imageBuffer,
      ContentType: 'image/jpeg',
    });

    await r2Client.send(command);
    console.log('Successfully uploaded to R2:', imagePath);

    return {
      path: imagePath,
      success: true
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
}

// Store generated image in user history
export async function storeGeneratedImage({
  imageData,
  userId,
  model,
  prompt,
  modelParams,
  aspectRatio,
  inputImages = [],
  numOutputs
}) {
  try {

    // 1. Generate organized path: model/timestamp-filename.jpg
    const timestamp = Date.now();
    const safePrompt = prompt ? generateSafeFileName(prompt, '') : model;
    const filename = `${timestamp}-${safePrompt}.jpg`;
    const imagePath = `${model}/${filename}`;

    // 2. Upload output image to R2 with organized path
    const imageBuffer = await imageUrlToBuffer(imageData);
    const uploadResult = await uploadToR2History(imageBuffer, imagePath);


    // 3. Process input images with same organized structure
    const processedInputs = [];
    for (let i = 0; i < inputImages.length; i++) {
      const inputImage = inputImages[i];
      if (inputImage) {
        try {
          const inputBuffer = await imageUrlToBuffer(inputImage);
          const inputFilename = `${timestamp}-input${i}.jpg`;
          const inputPath = `${model}/inputs/${inputFilename}`;
          await uploadToR2History(inputBuffer, inputPath);

          processedInputs.push({
            path: inputPath,
            type: `input${i}`,
            order: i
          });
          console.log(`Input image ${i} uploaded to:`, inputPath);
        } catch (error) {
          console.error(`Error uploading input image ${i}:`, error);
        }
      }
    }

    const isFreeModel = model === "background_removal" || model === "gfp-restore"
    let cost = isFreeModel ? 0 : process.env.DEFAULT_MODEL_RUNNING_COST;
    if (model === "combine-image") {
      cost = process.env.COMBINE_IMAGES_MODEL_RUNNING_COST;
    }
    console.log("cost----------------------------------", cost);
    console.log("numOutputs----------------------------------", numOutputs);
    if (model === "generate-image") {
      cost = cost * numOutputs;
    }


    const plan = await prisma.plan.findFirst({
      where: {
        userId: userId,
      }
    });
    await prisma.plan.update({
      where: {
        id: plan.id,
        userId: userId,
      },
      data: {
        remainingPoints: {
          decrement: parseInt(cost)
        }
      },
    })


    // 4. Store metadata in History table (primary storage)
    const historyRecord = await prisma.history.create({
      data: {
        userId,
        model,
        status: 'completed',
        outputImagePath: imagePath,
        inputImagePaths: processedInputs,
        publicUrl: generatePublicUrl(imagePath),
        cost: cost ? cost.toString() : null,
        prompt: prompt || null,
        modelParams: modelParams || null,
        aspectRatio: aspectRatio || null,
        isPublished: false,
        createdAt: new Date()
      }
    });

    return {
      historyId: historyRecord.id,
      publicUrl: generatePublicUrl(imagePath),
      imagePath: imagePath
    };

  } catch (error) {
    console.error('Error storing generated image:', error);
    throw error;
  }
}

// Publish image from history record (creates reference only, no re-upload)
export async function publishFromHistory(historyId, publishData) {
  try {
    console.log('Publishing image from history (reference only):', historyId);

    // 1. Get history record with user data
    const historyRecord = await prisma.history.findUnique({
      where: { id: historyId },
      include: { user: true }
    });

    if (!historyRecord) {
      throw new Error('History record not found');
    }

    if (historyRecord.isPublished) {
      throw new Error('Image already published');
    }

    // 2. Create reference in PublishedImage table (NO IMAGE RE-UPLOAD)
    // Image already exists in R2 at: model/image.jpg
    const publishedImage = await prisma.publishedImage.create({
      data: {
        userId: historyRecord.userId,
        userName: historyRecord.user.name,
        userEmail: historyRecord.user.email,
        outputImagePath: historyRecord.outputImagePath, // Reference to existing R2 path
        inputImagePaths: historyRecord.inputImagePaths, // Reference to existing input paths
        model: historyRecord.model,
        prompt: historyRecord.prompt,
        modelParams: historyRecord.modelParams,
        aspectRatio: historyRecord.aspectRatio,
        title: publishData.title || historyRecord.prompt || `${historyRecord.model} Creation`,
        isPublic: true,
        isApproved: true,
        historyId: historyId // Link back to original history record
      }
    });

    // 3. Update history record to mark as published
    await prisma.history.update({
      where: { id: historyId },
      data: {
        isPublished: true,
        publishedImageId: publishedImage.id
      }
    });

    return publishedImage;

  } catch (error) {
    console.error('Error publishing from history:', error);
    throw error;
  }
}

// Generate public URL from R2 path
export function generatePublicUrl(imagePath) {
  const publicBaseUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  console.log('generatePublicUrl called with:', { imagePath, publicBaseUrl });

  if (!publicBaseUrl) {
    console.warn('R2_PUBLIC_URL not configured. Using R2 endpoint as fallback.');
    console.warn('Image stored at bucket path:', imagePath);

    // Fallback: Use R2 endpoint to generate public URL
    const r2Endpoint = process.env.R2_ENDPOINT;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (r2Endpoint && bucketName) {
      // Convert R2 endpoint to public URL format
      // From: https://abc123.r2.cloudflarestorage.com
      // To: https://your-bucket.r2.cloudflarestorage.com/path
      const endpointUrl = new URL(r2Endpoint);
      const directUrl = `${endpointUrl.protocol}//${bucketName}.${endpointUrl.hostname}/${imagePath}`;

      console.log('Generated fallback public URL:', directUrl);
      return directUrl;
    }

    // Final fallback - return placeholder
    return `https://your-r2-domain.com/${imagePath}`;
  }

  const directUrl = `${publicBaseUrl}/${imagePath}`;
  console.log('Generated public URL:', directUrl);
  return directUrl;
}

// Get model type from config
export function getModelType(config) {
  if (config.generate_flux_images) return 'generate-image';
  if (config.hair_style_change) return 'hair-style';
  if (config.combine_images) return 'combine-image';
  if (config.text_removal) return 'text-removal';
  if (config.headshot) return 'headshot';
  if (config.restore_image) return 'restore-image';
  if (config.gfp_restore) return 'gfp-restore';
  if (config.home_designer) return 'home-designer';
  if (config.background_removal) return 'background-removal';
  if (config.remove_object) return 'remove-object';
  if (config.reimagine) return 're-imagine';
  return 'unknown';
}

// Get input images from config
export function getInputImagesFromConfig(config) {
  const inputImages = [];

  if (config.image) inputImages.push(config.image);
  if (config.input_image) inputImages.push(config.input_image);
  if (config.input_image_1) inputImages.push(config.input_image_1);
  if (config.input_image_2) inputImages.push(config.input_image_2);
  if (config.mask_image) inputImages.push(config.mask_image);

  return inputImages;
}

// Get model-specific input images from current state
export function getModelInputImages(selectedModel, currentState) {
  const inputImages = [];

  switch (selectedModel) {
    case 'hair-style':
      if (currentState.uploadedImage) {
        inputImages.push(currentState.uploadedImage);
      }
      break;

    case 'combine-image':
      if (currentState.combineImage1) {
        inputImages.push(currentState.combineImage1);
      }
      if (currentState.combineImage2) {
        inputImages.push(currentState.combineImage2);
      }
      break;

    case 'text-removal':
      if (currentState.textRemovalImage) {
        inputImages.push(currentState.textRemovalImage);
      }
      break;


    case 'headshot':
      if (currentState.headshotImage) {
        inputImages.push(currentState.headshotImage);
      }
      break;

    case 'restore-image':
      if (currentState.restoreImage) {
        inputImages.push(currentState.restoreImage);
      }
      break;

    case 'gfp-restore':
      if (currentState.gfpRestoreImage) {
        inputImages.push(currentState.gfpRestoreImage);
      }
      break;

    case 'home-designer':
      if (currentState.homeDesignerImage) {
        inputImages.push(currentState.homeDesignerImage);
      }
      break;

    case 'background-removal':
      if (currentState.backgroundRemovalImage) {
        inputImages.push(currentState.backgroundRemovalImage);
      }
      break;

    case 'remove-object':
      if (currentState.removeObjectImage) {
        inputImages.push(currentState.removeObjectImage);
      }
      if (currentState.removeObjectMask) {
        inputImages.push(currentState.removeObjectMask);
      }
      break;

    case 're-imagine':
      if (currentState.reimagineImage) {
        inputImages.push(currentState.reimagineImage);
      }
      break;

    default:
      break;
  }

  return inputImages;
}

// Get model-specific parameters
export function getModelParameters(selectedModel, currentState) {
  const baseParams = {
    aspectRatio: currentState.aspectRatio
  };

  switch (selectedModel) {
    case 'hair-style':
      return {
        ...baseParams,
        hairStyle: currentState.selectedHairStyle,
        hairColor: currentState.selectedHairColor,
        gender: currentState.selectedGender
      };

    case 'headshot':
      return {
        ...baseParams,
        gender: currentState.selectedHeadshotGender,
        background: currentState.selectedHeadshotBackground
      };

    case 're-imagine':
      return {
        ...baseParams,
        gender: currentState.selectedReimagineGender,
        scenario: currentState.selectedScenario
      };

    default:
      return baseParams;
  }
} 