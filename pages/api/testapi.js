// pages/api/getPlan.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions)
    console.log("first session", session)
    const { name, email, id } = session.user

    res.status(200).json({ name, email, id })
}

