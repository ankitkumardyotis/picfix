// pages/api/getPlan.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { priceStructure } from "@/constant/Constant";

export default async function handler(req, res) {
    // Create a plan details object
    const currency = "INR";
    let amount = '2499'
    const [planDetails] = priceStructure.filter((item) => item.currency === currency && item.price === amount)

    // const price = planDetails.find((item) => item.price === amount);


    res.status(200).json({ name: planDetails })
}

