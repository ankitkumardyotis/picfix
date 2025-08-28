import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { getUserPlan } from "@/lib/userData";
import { storeGeneratedImage, getModelType, getInputImagesFromConfig } from "@/lib/unifiedImageStorage";
import Replicate from "replicate";
import prisma from "@/lib/prisma";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function streamToBuffer(stream) {
  const chunks = [];
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const config = req.body.config;

  if (!session) {
    res.status(401).json("Please login to use this feature.");
    return;
  }
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });
  const isFreeModel = config.gfp_restore || config.background_removal || config.home_designer;

  const planData = await getUserPlan(session.user.id)
  const isFreePlan = planData.length === 0 || planData.some(item => item.name === "free") || planData.remainingPoints <= 0;


  if (!isFreeModel) {
    if (planData[0]?.remainingPoints === 0 || planData[0]?.remainingPoints < 1 || !planData[0]) {
      res.status(402).json("Please Subscribe to a plan to use this feature.");
      return;
    }
  }

  try {
    // POST request to Replicate to start the image restoration generation process

    if (config.generate_flux_images) {
      const input = {
        prompt: config.prompt,
        go_fast: true,
        megapixels: "1",
        num_outputs: config.num_outputs,
        aspect_ratio: config.aspect_ratio,
        output_format: "jpg",
        output_quality: 100,
        num_inference_steps: 4
      };


      const output = await replicate.run("black-forest-labs/flux-schnell", { input });

      // Process the output
      const processedOutput = [];
      for (const item of output) {
        if (item instanceof ReadableStream) {
          const buffer = await streamToBuffer(item);
          // Convert buffer to base64
          const base64 = buffer.toString('base64');
          const dataUrl = `data:image/jpeg;base64,${base64}`;
          processedOutput.push(dataUrl);
        } else if (typeof item === 'string') {
          processedOutput.push(item);
        }
      }



      const finalOutput = processedOutput.slice(0, config.num_outputs);


      // Store images in history
      try {
        const storedImages = [];
        for (const imageData of finalOutput) {
          const storedImage = await storeGeneratedImage({
            imageData,
            userId: session.user.id,
            model: getModelType(config),
            prompt: config.prompt,
            cost: process.env.DEFAULT_MODEL_RUNNING_COST,
            modelParams: config,
            aspectRatio: config.aspect_ratio,
            numOutputs: config.num_outputs,
            inputImages: getInputImagesFromConfig(config)
          });

          storedImages.push({
            imageUrl: storedImage.publicUrl,
            historyId: storedImage.historyId
          });
        }
        res.status(200).json(storedImages);
      } catch (error) {
        console.error('Error storing images in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(finalOutput);
      }
    } else if (config.hair_style_change) {
      const input = {
        input_image: config.image, // This can be either a URL from R2 or base64 data
        haircut: config.hair_style,
        hair_color: config.hair_color,
        gender: config.gender.toLowerCase(),
        aspect_ratio: config.aspect_ratio,
        safety_tolerance: 2,
        output_format: "jpg",
      };



      const output = await replicate.run("flux-kontext-apps/change-haircut", { input });

      // Process the output - hair style model returns single image
      let processedOutput;
      if (output instanceof ReadableStream) {
        const buffer = await streamToBuffer(output);
        const base64 = buffer.toString('base64');
        processedOutput = `data:image/jpeg;base64,${base64}`;
      } else if (typeof output === 'string') {
        processedOutput = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // If it returns an array, take the first item
        const firstItem = output[0];
        if (firstItem instanceof ReadableStream) {
          const buffer = await streamToBuffer(firstItem);
          const base64 = buffer.toString('base64');
          processedOutput = `data:image/jpeg;base64,${base64}`;
        } else {
          processedOutput = firstItem;
        }
      }

      // Store hair style image in history
      try {
        const storedImage = await storeGeneratedImage({
          imageData: processedOutput,
          userId: session.user.id,
          model: getModelType(config),
          prompt: null, // Hair style doesn't use prompts
          modelParams: config,
          aspectRatio: config.aspect_ratio,
          inputImages: getInputImagesFromConfig(config)
        });


        res.status(200).json({
          imageUrl: storedImage.publicUrl,
          historyId: storedImage.historyId
        });
      } catch (error) {
        console.error('Error storing hair style image in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(processedOutput);
      }
    } else if (config.combine_images) {

      const input = {
        prompt: config.prompt,
        aspect_ratio: config.aspect_ratio,
        input_image_1: config.input_image_1,
        input_image_2: config.input_image_2,
        output_format: "png",
        safety_tolerance: 2
      };


      const output = await replicate.run("flux-kontext-apps/multi-image-kontext-pro", { input });

      // Process the output - combine image model returns single image
      let processedOutput;
      if (output instanceof ReadableStream) {
        const buffer = await streamToBuffer(output);
        const base64 = buffer.toString('base64');
        processedOutput = `data:image/png;base64,${base64}`;
      } else if (typeof output === 'string') {
        processedOutput = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // If it returns an array, take the first item
        const firstItem = output[0];
        if (firstItem instanceof ReadableStream) {
          const buffer = await streamToBuffer(firstItem);
          const base64 = buffer.toString('base64');
          processedOutput = `data:image/png;base64,${base64}`;
        } else {
          processedOutput = firstItem;
        }
      }

      // Store combined image in history
      try {
        const storedImage = await storeGeneratedImage({
          imageData: processedOutput,
          userId: session.user.id,
          model: getModelType(config),
          prompt: config.prompt,
          cost: process.env.COMBINE_IMAGES_MODEL_RUNNING_COST,
          modelParams: config,
          aspectRatio: config.aspect_ratio,
          inputImages: getInputImagesFromConfig(config)
        });

        res.status(200).json({
          imageUrl: storedImage.publicUrl,
          historyId: storedImage.historyId
        });
      } catch (error) {
        console.error('Error storing combined image in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(processedOutput);
      }
    } else if (config.text_removal) {

      const input = {
        input_image: config.input_image,
        aspect_ratio: config.aspect_ratio,
        output_format: config.output_format || "png",
        safety_tolerance: config.safety_tolerance || 2
      };



      const output = await replicate.run("flux-kontext-apps/text-removal", { input });

      // Process the output - text removal model returns single image
      let processedOutput;
      if (output instanceof ReadableStream) {
        const buffer = await streamToBuffer(output);
        const base64 = buffer.toString('base64');
        processedOutput = `data:image/png;base64,${base64}`;
      } else if (typeof output === 'string') {
        processedOutput = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // If it returns an array, take the first item
        const firstItem = output[0];
        if (firstItem instanceof ReadableStream) {
          const buffer = await streamToBuffer(firstItem);
          const base64 = buffer.toString('base64');
          processedOutput = `data:image/png;base64,${base64}`;
        } else {
          processedOutput = firstItem;
        }
      }

      // Store text removal image in history
      try {
        const storedImage = await storeGeneratedImage({
          imageData: processedOutput,
          userId: session.user.id,
          model: getModelType(config),
          prompt: null, // Text removal doesn't use prompts
          cost: process.env.DEFAULT_MODEL_RUNNING_COST,
          modelParams: config,
          aspectRatio: config.aspect_ratio,
          inputImages: getInputImagesFromConfig(config)
        });

        res.status(200).json({
          imageUrl: storedImage.publicUrl,
          historyId: storedImage.historyId
        });
      } catch (error) {
        console.error('Error storing text removal image in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(processedOutput);
      }

    } else if (config.headshot) {
      const input = {
        input_image: config.input_image,
        gender: config.gender,
        background: config.background,
        aspect_ratio: config.aspect_ratio,
        output_format: config.output_format || "png",
        safety_tolerance: config.safety_tolerance || 2
      };



      const output = await replicate.run("flux-kontext-apps/professional-headshot", { input });


      let processedOutput;
      if (output instanceof ReadableStream) {
        const buffer = await streamToBuffer(output);
        const base64 = buffer.toString('base64');
        processedOutput = `data:image/png;base64,${base64}`;
      } else if (typeof output === 'string') {
        processedOutput = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // If it returns an array, take the first item
        const firstItem = output[0];
        if (firstItem instanceof ReadableStream) {
          const buffer = await streamToBuffer(firstItem);
          const base64 = buffer.toString('base64');
          processedOutput = `data:image/png;base64,${base64}`;
        } else {
          processedOutput = firstItem;
        }
      }

      // Store headshot image in history
      try {
        const storedImage = await storeGeneratedImage({
          imageData: processedOutput,
          userId: session.user.id,
          model: getModelType(config),
          prompt: null, // Headshot doesn't use prompts
          cost: process.env.DEFAULT_MODEL_RUNNING_COST,
          modelParams: config,
          aspectRatio: config.aspect_ratio,
          inputImages: getInputImagesFromConfig(config)
        });

        res.status(200).json({
          imageUrl: storedImage.publicUrl,
          historyId: storedImage.historyId
        });
      } catch (error) {
        console.error('Error storing headshot image in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(processedOutput);
      }
    } else if (config.restore_image) {
      const input = {
        input_image: config.input_image,
        output_format: config.output_format || "png",
        safety_tolerance: config.safety_tolerance || 2
        // Aspect ratio is not needed for restore-image model
      };



      const output = await replicate.run("flux-kontext-apps/restore-image", { input });


      let processedOutput;
      if (output instanceof ReadableStream) {
        const buffer = await streamToBuffer(output);
        const base64 = buffer.toString('base64');
        processedOutput = `data:image/png;base64,${base64}`;
      } else if (typeof output === 'string') {
        processedOutput = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // If it returns an array, take the first item
        const firstItem = output[0];
        if (firstItem instanceof ReadableStream) {
          const buffer = await streamToBuffer(firstItem);
          const base64 = buffer.toString('base64');
          processedOutput = `data:image/png;base64,${base64}`;
        } else {
          processedOutput = firstItem;
        }
      }

      // Store restore image in history
      try {
        const storedImage = await storeGeneratedImage({
          imageData: processedOutput,
          userId: session.user.id,
          model: getModelType(config),
          prompt: null, // Restore image doesn't use prompts
          cost: process.env.DEFAULT_MODEL_RUNNING_COST,
          modelParams: config,
          aspectRatio: null, // Restore image preserves original aspect ratio
          inputImages: getInputImagesFromConfig(config)
        });


        res.status(200).json({
          imageUrl: storedImage.publicUrl,
          historyId: storedImage.historyId
        });
      } catch (error) {
        console.error('Error storing restore image in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(processedOutput);
      }
    } else if (config.reimagine) {
      const input = {
        input_image: config.input_image,
        gender: config.gender || "none",
        aspect_ratio: config.aspect_ratio,
        output_format: config.output_format || "png",
        safety_tolerance: config.safety_tolerance || 2,
        impossible_scenario: config.impossible_scenario || "Random"
      };


      const output = await replicate.run("flux-kontext-apps/impossible-scenarios", { input });



      let processedOutput;
      if (output instanceof ReadableStream) {
        const buffer = await streamToBuffer(output);
        const base64 = buffer.toString('base64');
        processedOutput = `data:image/png;base64,${base64}`;
      } else if (typeof output === 'string') {
        processedOutput = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // If it returns an array, take the first item
        const firstItem = output[0];
        if (firstItem instanceof ReadableStream) {
          const buffer = await streamToBuffer(firstItem);
          const base64 = buffer.toString('base64');
          processedOutput = `data:image/png;base64,${base64}`;
        } else {
          processedOutput = firstItem;
        }
      }

      // Store reimagine image in history
      try {
        const storedImage = await storeGeneratedImage({
          imageData: processedOutput,
          userId: session.user.id,
          model: getModelType(config),
          prompt: null, // Reimagine doesn't use prompts
          cost: process.env.DEFAULT_MODEL_RUNNING_COST,
          modelParams: config,
          aspectRatio: config.aspect_ratio,
          inputImages: getInputImagesFromConfig(config)
        });

        res.status(200).json({
          imageUrl: storedImage.publicUrl,
          historyId: storedImage.historyId
        });
      } catch (error) {
        console.error('Error storing reimagine image in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(processedOutput);
      }
    } else if (config.gfp_restore) {
      const input = {
        img: config.input_image
      };



      const output = await replicate.run("tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c", { input });


      let processedOutput;
      if (output instanceof ReadableStream) {
        const buffer = await streamToBuffer(output);
        const base64 = buffer.toString('base64');
        processedOutput = `data:image/png;base64,${base64}`;
      } else if (typeof output === 'string') {
        processedOutput = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // If it returns an array, take the first item
        const firstItem = output[0];
        if (firstItem instanceof ReadableStream) {
          const buffer = await streamToBuffer(firstItem);
          const base64 = buffer.toString('base64');
          processedOutput = `data:image/png;base64,${base64}`;
        } else {
          processedOutput = firstItem;
        }
      }

      // If user doesn't have plan then dont store the image in db and dont show history as well

      if (isFreePlan) {
        res.status(200).json({
          imageUrl: processedOutput,
          historyId: null
        });
        return;
      }

      // Store GFP restore image in history
      try {
        const storedImage = await storeGeneratedImage({
          imageData: processedOutput,
          userId: session.user.id,
          model: getModelType(config),
          prompt: null, // GFP restore doesn't use prompts
          cost: process.env.DEFAULT_MODEL_RUNNING_COST,
          modelParams: config,
          aspectRatio: null, // GFP restore preserves original aspect ratio
          inputImages: getInputImagesFromConfig(config)
        });

        res.status(200).json({
          imageUrl: storedImage.publicUrl,
          historyId: storedImage.historyId
        });
      } catch (error) {
        console.error('Error storing GFP restore image in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(processedOutput);
      }
    } else if (config.home_designer) {

      const input = {
        image: config.input_image,
        prompt: config.prompt
      };



      const output = await replicate.run("jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b", { input });

      // Process the output - home designer model returns single image


      let processedOutput;
      if (output instanceof ReadableStream) {
        const buffer = await streamToBuffer(output);
        const base64 = buffer.toString('base64');
        processedOutput = `data:image/png;base64,${base64}`;
      } else if (typeof output === 'string') {
        processedOutput = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // If it returns an array, take the first item
        const firstItem = output[1];
        if (firstItem instanceof ReadableStream) {
          const buffer = await streamToBuffer(firstItem);
          const base64 = buffer.toString('base64');
          processedOutput = `data:image/png;base64,${base64}`;
        } else {
          processedOutput = firstItem;
        }
      }

      // If user doesn't have plan then dont store the image in db and dont show history as well

      if (isFreePlan) {
        res.status(200).json({
          imageUrl: processedOutput,
          historyId: null
        });
        return;
      }


      // Store home designer image in history
      try {
        const storedImage = await storeGeneratedImage({
          imageData: processedOutput,
          userId: session.user.id,
          model: getModelType(config),
          prompt: config.prompt,
          cost: process.env.DEFAULT_MODEL_RUNNING_COST,
          modelParams: config,
          aspectRatio: config.aspect_ratio,
          inputImages: getInputImagesFromConfig(config)
        });


        res.status(200).json({
          imageUrl: storedImage.publicUrl,
          historyId: storedImage.historyId
        });
      } catch (error) {
        console.error('Error storing home designer image in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(processedOutput);
      }
    } else if (config.remove_object) {

      const input = {
        mask: config.mask_image,
        image: config.input_image
      };



      const output = await replicate.run("allenhooo/lama:cdac78a1bec5b23c07fd29692fb70baa513ea403a39e643c48ec5edadb15fe72", { input });

      // Process the output - remove object model returns single image


      let processedOutput;
      if (output instanceof ReadableStream) {
        const buffer = await streamToBuffer(output);
        const base64 = buffer.toString('base64');
        processedOutput = `data:image/png;base64,${base64}`;
      } else if (typeof output === 'string') {
        processedOutput = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // If it returns an array, take the first item
        const firstItem = output[0];
        if (firstItem instanceof ReadableStream) {
          const buffer = await streamToBuffer(firstItem);
          const base64 = buffer.toString('base64');
          processedOutput = `data:image/png;base64,${base64}`;
        } else {
          processedOutput = firstItem;
        }
      }

      // Store remove object image in history
      try {
        const storedImage = await storeGeneratedImage({
          imageData: processedOutput,
          userId: session.user.id,
          model: getModelType(config),
          prompt: null, // Remove object doesn't use prompts
          cost: process.env.DEFAULT_MODEL_RUNNING_COST,
          modelParams: config,
          aspectRatio: null, // Remove object preserves original aspect ratio
          inputImages: getInputImagesFromConfig(config)
        });


        res.status(200).json({
          imageUrl: storedImage.publicUrl,
          historyId: storedImage.historyId
        });
      } catch (error) {
        console.error('Error storing remove object image in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(processedOutput);
      }
    } else if (config.edit_image) {

      const input = {
        prompt: config.prompt,
        image_input: [config.input_image]
      };


      const output = await replicate.run("google/nano-banana", { input });



      let processedOutput;
      if (output instanceof ReadableStream) {
        const buffer = await streamToBuffer(output);
        const base64 = buffer.toString('base64');
        processedOutput = `data:image/png;base64,${base64}`;
      } else if (typeof output === 'string') {
        processedOutput = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // If it returns an array, take the first item
        const firstItem = output[0];
        if (firstItem instanceof ReadableStream) {
          const buffer = await streamToBuffer(firstItem);
          const base64 = buffer.toString('base64');
          processedOutput = `data:image/png;base64,${base64}`;
        } else {
          processedOutput = firstItem;
        }
      }

      // Store edit image in history
      try {
        const storedImage = await storeGeneratedImage({
          imageData: processedOutput,
          userId: session.user.id,
          model: getModelType(config),
          prompt: config.prompt,
          cost: process.env.DEFAULT_MODEL_RUNNING_COST,
          modelParams: config,
          aspectRatio: null, // Edit image preserves original aspect ratio
          inputImages: getInputImagesFromConfig(config)
        });


        res.status(200).json({
          imageUrl: storedImage.publicUrl,
          historyId: storedImage.historyId
        });
      } catch (error) {
        console.error('Error storing remove object image in history:', error);
        // Fallback to original behavior if storage fails
        res.status(200).json(processedOutput);
      }

    } else {
      res.status(400).json("Invalid request");
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json("Server is busy please try again later");
  }

}