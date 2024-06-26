import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import prisma from "@/lib/prisma"
import { getUserPlan } from "@/lib/userData";


export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const fileUrl = req.body.imageUrl;



  if (!session) {
    res.status(401).json("Unauthorized");
    return;
  }

  const planData = await getUserPlan(session.user.id)


  if (planData[0]?.remainingPoints === 0 || planData[0]?.remainingPoints < 1 || !planData[0]) {
    res.status(402).json("Please Subscribe to a plan to use this feature.");
    return;
  }


  try {
    // POST request to Replicate to start the image restoration generation process
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        version:
          "9451bfbf652b21a9bccc741e5c7046540faa5586cfa3aa45abc7dbb46151a4f7",
        input: { image: fileUrl, classess: 88, mode: "Real Gray Colorization" },
      }),
    });

    let jsonStartResponse = await startResponse.json();
    let endpointUrl = jsonStartResponse.urls.get;
    let cancelUrl = jsonStartResponse.urls.cancel;

    // GET request to get the status of the image restoration process & return the result when it's ready
    let restoredImage = null;
    let responseFromReplicate;
    let count = 0;

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
      count=count+2;
      
      if (count > 80) {
        const cancleJson = await fetch(cancelUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + process.env.REPLICATE_API_KEY,
          },
        })
        res.status(500).json(cancleJson)
        break;
        return;
      }
      if (jsonFinalResponse.status === "succeeded") {
        restoredImage = jsonFinalResponse.output;
        responseFromReplicate = jsonFinalResponse
      } else if (jsonFinalResponse.status === "failed") {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } res.status(200).json(responseFromReplicate)
  }
  catch (err) {
    res.status(500).json("Server is busy please try again later");
  }
}