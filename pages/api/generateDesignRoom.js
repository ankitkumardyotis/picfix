import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import prisma from "@/lib/prisma"
import { getUserPlan } from "@/lib/userData";

export default async function handler(req, res) {

  const session = await getServerSession(req, res, authOptions)
  const fileUrl = req.body.imageUrl;
  const prompt = req.body.prompt;
  console.log(prompt);
  console.log("Design Room=>" + fileUrl);
  // POST request to Replicate to start the image  generation process


  if (!session) {
    res.status(401).json("Unauthorized");
    return;
  }

  const planData = await getUserPlan(session.user.id)
  console.log("planData=====.", planData)

  if (planData[0]?.remainingPoints === 0 || planData[0]?.remainingPoints < 1 || !planData[0]) {
    res.status(402).json("Please Subscribe to a plan to use this feature.");
    return;
  }

  // if (planData.remainingPoints < 5) {
  //   res.status(402).json("You don't have enough credit points to use this feature.");
  //   return;
  // }

  // console.log("planData in api ai home makeover",planData)

  try {
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        version:
          "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
        input: {
          image: fileUrl,
          prompt: prompt,
          num_samples: '1',
          image_resolution: '512',
          ddim_steps: 20,
          scale: 9,
          a_prompt: "best quality, extremely detailed",
          n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, nudity,Voilence,Sexual Content,Adult Content,private Content,Harassment,Bullying,Suicide,weapons",
          detect_resolution: 512,
          value_threshold: 0.1,
          distance_threshold: 0.1
        },
      }),
    });
    try {
      let jsonStartResponse = await startResponse.json();
      console.log(jsonStartResponse.urls, jsonStartResponse.output);
      let endpointUrl = jsonStartResponse.urls.get;

      // // GET request to get the status of the image  process & return the result when it's ready
      let restoredImage = null;
      let responseFromReplicate;
      let count = 0;
      while (!restoredImage) {
        // Loop in 1s intervals until the alt text is ready
        console.log("polling for result...");
        let finalResponse = await fetch(endpointUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + process.env.REPLICATE_API_KEY,
          },
        });
        let jsonFinalResponse = await finalResponse.json();
        console.log("Json response" + jsonStartResponse.output);
        count = count + 2;
        if (count > 100) {
          const cancleJson = await fetch(cancelUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Token " + process.env.REPLICATE_API_KEY,
            },
          })
          console.log("cancleJson", cancleJson)
          res.status(500).json(cancleJson)
          break;
          return;
        }

        if (jsonFinalResponse.status === "succeeded") {
          restoredImage = jsonFinalResponse.output;
          responseFromReplicate = jsonFinalResponse

          // const saveCreditPoint = await prisma.plan.update({
          //   where: {
          //     id: planData[0].id, // Assuming you only have one plan per user
          //     userId: session.user.id
          //   },
          //   data: {
          //     remainingPoints: {
          //       decrement: 1
          //     }
          //   },
          // }).catch(err => {
          //   console.error('Error creating Plan:', err);
          // })

          // const createPlan = await prisma.history.create({
          //   data: {
          //     userId: session.user.id,
          //     model: jsonFinalResponse.model,
          //     status: jsonFinalResponse.status,
          //     createdAt: jsonFinalResponse.created_at,
          //     replicateId: jsonFinalResponse.id
          //   }
          // }).catch(err => {
          //   console.error('Error creating Plan:', err);
          // });
        } else if (jsonFinalResponse.status === "failed") {
          break;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } res.status(200).json(responseFromReplicate);
    }
    catch (error) {
      res.status(400).json({ error: error });
    }
  } catch (err) {
    console.log("Error in restore image", err);
    res.status(500).json("Server is busy please try again later");
  }
}