import prisma from '@/lib/prisma';



export default async function handler(req, res) {


    // try {
    //     const userData = await prisma.user.findMany();

    //     const filterData = userData.filter((item, idx) => idx < 500 && item.name !== 'Abdullah Jacobs' && item.name !== 'Richard Warner').map((item, idx) => {
    //         return { name: item.name, email: item.email, }
    //     })

    //     res.status(200).json({ userData: filterData });
    // } catch (error) {
    //     res.status(500).json({ message: 'Internal Server Error' });
    // }
}