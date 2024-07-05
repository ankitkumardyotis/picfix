import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import prisma from "@/lib/prisma"
import { getUserPlan } from "@/lib/userData";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const fileUrl = req.body.imageUrl;
  const prompt = req.body.prompt;
  const clothingPosition = req.body.clothingPosition;

  if (!session) {
    res.status(401).json("Unauthorized");
    return;
  }

  // const planData = await getUserPlan(session.user.id)


  // if (planData[0]?.remainingPoints === 0 || planData[0]?.remainingPoints < 1 || !planData[0]) {
  //   res.status(402).json("Please Subscribe to a plan to use this feature.");
  //   return;
  // }


  try {
    // POST request to Replicate to start the image  generation process
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        version:
          "4e7916cc6ca0fe2e0e414c32033a378ff5d8879f209b1df30e824d6779403826",
        input: {
          image: fileUrl,
          clothing: clothingPosition,
          prompt: "a person wearing " + prompt + ", best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning"
        },
      }),
    });

    try {
      let jsonStartResponse = await startResponse.json();
      let endpointUrl = jsonStartResponse.urls.get;
      // // GET request to get the status of the image  process & return the result when it's ready
      let restoredImage = null;
      let responseFromReplicate;
      while (!restoredImage) {
        // Loop in 1s intervals until the alt text is ready
     
        let finalResponse = await fetch(endpointUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + process.env.REPLICATE_API_KEY,
          },
        });
        let jsonFinalResponse = await finalResponse.json();
        if (jsonFinalResponse.status === "succeeded") {
          restoredImage = jsonFinalResponse.output;
          responseFromReplicate = jsonFinalResponse
        } else if (jsonFinalResponse.status === "failed") {
          break;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } res.status(200).json(responseFromReplicate);
    }
    catch (error) {
      res.status(400).json({ error: error });
    }
  } catch (err) {
    res.status(500).json("Server is busy please try again later");
  }



}