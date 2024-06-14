// pages/api/getPlan.js

import prisma from '@/lib/prisma';
// import { getSocket } from '@/lib/socket';
// import prisma from "@/pages/api/_lib/prisma";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const { userId } = req.query;

    try {
        const plan = await prisma.plan.findFirst({
            where: {
                userId: userId,
            }
        });
        const saveCreditPoint = await prisma.plan.update({
            where: {
                id: plan.id,
                userId: userId,
            },
            data: {
                remainingPoints: {
                    decrement: 1
                }
            },
        })

        // const emitEvent = await getSocket();

        // emitEvent("model-run-success", { decrementValue: 1 })

        console.log("saveCreditPoint", saveCreditPoint)
        res.status(200).json({ saveCreditPoint });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
