// pages/api/getPlan.js

import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { userId } = req.query;

    console.log("user id", userId)
    try {
        const plan = await prisma.plan.findUnique({
            where: {
                userId: userId,
                status: 'active'
            }
        });

        res.status(200).json({ plan });
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
