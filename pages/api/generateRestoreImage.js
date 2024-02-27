import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import prisma from "@/lib/prisma"

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const fileUrl = req.body.imageUrl;

  if (!session) {
    res.status(401).json("Unauthorized");
    return;
  }

  let planData = await prisma.plan.findMany({
    where: {
      userId: session.user.id,
      status: "active"
    }
  }).catch(err => {
    console.error('Error creating Plan:', err);
  });


  console.log(planData)

  if (planData.length === 0) {
    res.status(401).json("Please Subscribe to a plan to use this feature.");
    return;
  }

  if (planData[0].creditPoints < 5) {
    res.status(401).json("You don't have enough credit points to use this feature.");
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
          "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        input: { img: fileUrl, version: "v1.4", scale: 2 },
      }),
    });
    console.log("startResponse", startResponse)
    let jsonStartResponse = await startResponse.json();
    // console.log("Json response" + JSON.stringify(jsonStartResponse));
    let endpointUrl = jsonStartResponse.urls.get;

    // // GET request to get the status of the image restoration process & return the result when it's ready
    let restoredImage = null;
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

      if (jsonFinalResponse.status === "succeeded") {
        restoredImage = jsonFinalResponse.output;

        const saveCreditPoint = await prisma.plan.update({
          where: {
            id: planData[0].id, // Assuming you only have one plan per user
            userId: session.user.id
          },
          data: {
            creditPoints: {
              decrement: 5
            }
          },
        }).catch(err => {
          console.error('Error creating Plan:', err);
        })

        const createPlan = await prisma.history.create({
          data: {
            userId: session.user.id,
            model: jsonFinalResponse.model,
            status: jsonFinalResponse.status,
            createdAt: jsonFinalResponse.created_at,
            replicateId: jsonFinalResponse.id
          }
        }).catch(err => {
          console.error('Error creating Plan:', err);
        });


      } else if (jsonFinalResponse.status === "failed") {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } res.status(200).json(restoredImage ? restoredImage : "Server is busy please try again later");
  } catch (err) {
    console.log("Error in restore image", err);
    res.status(500).json("Server is busy please try again later");
  }
}