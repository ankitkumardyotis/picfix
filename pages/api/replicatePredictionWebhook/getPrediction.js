// import { getServerSession } from "next-auth/next"
// import { authOptions } from "../api/auth/[...nextauth]"
// import { getUserPlan } from "@/lib/userData";

export default async function handler(req, res) {
    const fileUrl = req.body.imageUrl;


    //   const session = await getServerSession(req, res, authOptions)
    //   if (!session) {
    //     res.status(401).json("Unauthorized");
    //     return;
    //   }
    //   const planData = await getUserPlan(session.user.id)
    //   console.log("planData=====.",planData)

    //   if (planData[0]?.remainingPoints === 0 || planData[0]?.remainingPoints < 1 || !planData[0]) {
    //     res.status(402).json("Please Subscribe to a plan to use this feature.");
    //     return;
    //   }

    try {
        // POST request to Replicate to start the image restoration generation process
        const callbackURL = `${process.env.REPLICATE_WEBHOOK_URL}/api/replicatePredictionWebhook/restorePhotoWebhook`;
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
                webhook: callbackURL,
                webhook_events_filter: ["completed"],
            }),

        });
        let jsonStartResponse = await startResponse.json();

        console.log("responseFromReplicate in restore photo", jsonStartResponse)
        res.status(200).json(jsonStartResponse);
    } catch (err) {
        console.log("Error in restore image", err);
        res.status(500).json("Server is busy please try again later");
    }
}