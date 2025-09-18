import prisma from '@/lib/prisma';



export default async function handler(req, res) {


    try {
        const userData = await prisma.user.findMany();
        res.status(200).json({ userLength: userData.length, userData: userData });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}