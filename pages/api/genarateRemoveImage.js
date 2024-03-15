import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const fileUrl = req.body.imageUrl;
  const session = await getServerSession(req, res, authOptions)



  if (!session) {
    res.status(401).json("Unauthorized");
    return;
  }

  // let planData = await prisma.plan.findMany({
  //   where: {
  //     userId: session.user.id,
  //     status: "active"
  //   }
  // }).catch(err => {
  //   console.error('Error creating Plan:', err);
  // });

  // if (planData.length === 0) {
  //   res.status(401).json("Please Subscribe to a plan to use this feature.");
  //   return;
  // }

  // if (planData[0].creditPoints < 5) {
  //   res.status(401).json("You don't have enough credit points to use this feature.");
  //   return;
  // }
  console.log("fileUrl", fileUrl)
  
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
        "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
        input: { image: fileUrl },
      }),
    });
    
    let jsonStartResponse = await startResponse.json();
    console.log("fileUrl", jsonStartResponse)
    console.log("Json response in rem bg" + jsonStartResponse);
    let endpointUrl = jsonStartResponse.urls.get;
    console.log(process.env.REPLICATE_API_KEY);

    // // GET request to get the status of the image restoration process & return the result when it's ready
    let removeBackground = null;
    while (!removeBackground) {
      // Loop in 1s intervals until the alt text is ready
      console.log("polling for result in Remove Background...");
      let finalResponse = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + process.env.REPLICATE_API_KEY,
        },
      });
      let jsonFinalResponse = await finalResponse.json();

      if (jsonFinalResponse.status === "succeeded") {
        removeBackground = jsonFinalResponse.output;

        // const saveCreditPoint = await prisma.plan.update({
        //   where: {
        //     id: planData[0].id, // Assuming you only have one plan per user
        //     userId: session.user.id
        //   },
        //   data: {
        //     creditPoints: {
        //       decrement: 5
        //     }
        //   },
        // }).catch(err => {
        //   console.error('Error creating Plan:', err);
        // })
        // console.log("jsonFinalResponse", jsonFinalResponse)

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
        // console.log("createPlan", createPlan);
      } else if (jsonFinalResponse.status === "failed") {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } res.status(200).json(removeBackground ? removeBackground : "Failed to restore image");
  } catch (err) {
    console.log("Error in restore image", err);
    res.status(500).json("Server is busy please try again later");
  }
}