// pages/api/getPlan.js

// import prisma from '@/lib/prisma';
import fun from "@/lib/resend";

export default async function handler(req, res) {


    fun()


    return res.status(200).json({ message: 'ypu are welcome' });


}
