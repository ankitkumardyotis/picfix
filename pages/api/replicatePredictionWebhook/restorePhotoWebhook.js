import prisma from "@/lib/prisma";
import { error } from "console";

export default async function handler(req, res) {


    console.log("You are in webhook configuration")
    const output = []


    const successfulPrediction = req.body;

    if (successfulPrediction.status === 'succeeded') {
        console.log("successfulPrediction=================", successfulPrediction)

        // const eventData = {
        //     rId: successfulPrediction.id,
        //     created_at: successfulPrediction.created_at,
        //     error: successfulPrediction.error,
        //     model: successfulPrediction.model,
        //     output: successfulPrediction.output,
        //     status: successfulPrediction.status

        // }
        output.push(successfulPrediction.output)

        const saveWebhookData = await prisma.WebhookEvent.create({
            data: {
                replicateId: successfulPrediction.id,
                created_at: successfulPrediction.created_at,
                model: successfulPrediction.model,
                output: output,
                status: successfulPrediction.status
            },
        })



    }
    res.status(200).json("Webhook Recieved Successfully");

}

