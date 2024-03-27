// pages/api/getPlan.js

import prisma from '@/lib/prisma';
// import prisma from "@/pages/api/_lib/prisma";

export default async function handler(req, res) {
    // if (req.method !== 'GET') {
    //     return res.status(405).json({ message: 'Method Not Allowed' });
    // }
    const { replicateId } = req.query;

    try {
        const webhookData = await prisma.WebhookEvent.findFirst({
            where: {
                replicateId: replicateId,
            }
        });
        console.log("webhookData", webhookData)
        if (!webhookData) {
            res.status(400).json("No Data Found")
            return
        } else {
            res.status(200).json({ webhookData });
        }
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
