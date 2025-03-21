// pages/api/getPlan.js

import prisma from '@/lib/prisma';
// import fun from "@/lib/resend";
// import { getToken } from "next-auth/jwt"

// const secret = process.env.NEXTAUTH_SECRET
// 
export default async function handler(req, res) {

    // const token = await getToken({ req, secret })
    // res.end()

    const userList = await prisma.user.findMany();
    console.log(userList);
    res.status(200).json({ userList });
}
