import prisma from "@/lib/prisma";
import { encryptRazorpayPayment } from "@/utils/encryptAlgoForRazorpay";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import Razorpay from "razorpay"
import { v4 as uuid } from "uuid";
import { priceStructure } from "@/constant/Constant";


const instance = new Razorpay({
    key_id: process.env.RAZORPAY_TEST_KEY_ID,
    key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

export default async function handler(req, res) {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const session = await getServerSession(req, res, authOptions)

    console.log("session", session)
    // if (!session) {
    //     // Signed in
    //     res.status(200).json({ message: "You are not Authorised" })
    // }                    

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const isAuthentic = encryptRazorpayPayment(body, razorpay_signature);

    if (isAuthentic) {
        // const order = await instance.orders.fetch(razorpay_order_id);
        const order = await instance.orders.fetchPayments(razorpay_order_id);
        const currentDate = new Date();
        // add payment to database 


        const [planDetails] = priceStructure.filter((item) => item.currency === order.items[0].currency && item.price == (order.items[0].amount / 100))

        console.log("planDetails=====>", planDetails)


        console.log("order====================", order)
        await prisma.PaymentHistory.create({
            data: {
                transactionId: razorpay_payment_id,
                orderId: razorpay_order_id,
                userId: session.user.id,
                userName: session.user.name,
                emailId: order.items[0].email,
                contact: order.items[0].contact,
                planName: planDetails.name,
                creditPoints: parseInt(planDetails.creditPoints),
                createdAt: currentDate,
                amount: order.items[0].amount / 100,
                currency: order.items[0].currency,//to be added with actual plan         
                paymentStatus: order.items[0].status,
            }
        })

        const expiryDate = new Date(currentDate);
        expiryDate.setFullYear(currentDate.getFullYear() + 1);
        // Convert expiry date to ISO string format
        const expiryISOString = expiryDate.toISOString();


        const createPlan = await prisma.Plan.upsert({
            where: {
                userId: session.user.id // Assuming userId is unique and identifies the user uniquely
            },
            update: {
                userName: session.user.name,
                emailId: session.user.email,
                planName: planDetails.name,  //to be added with actual plan
                creditPoints: {
                    increment: parseInt(planDetails.creditPoints)
                },
                remainingPoints: {
                    increment: parseInt(planDetails.creditPoints)
                },
                createdAt: currentDate,
                expiredAt: expiryISOString,
            },
            create: {
                userId: session.user.id,
                userName: session.user.name,
                emailId: session.user.email,
                planName: planDetails.name,  //to be added with actual plan
                creditPoints: parseInt(planDetails.creditPoints), //to be added with actual plan        
                remainingPoints: parseInt(planDetails.creditPoints), //to be added with actual plan    
                createdAt: currentDate,
                expiredAt: expiryISOString,
            }
        });


        // Add Payment Details to Database after succefull Payment 
        res.redirect(
            `${process.env.NEXTAUTH_URL}/paymentSuccess?transactionId=${order.items[0].id}&amount=${order.items[0].amount}&paymentMethod=${order.items[0].method}&currency=${order.items[0].currency}&status=${'success'}&email=${order.items[0].email}`
        );

    } else {
        res.status(400).json({
            success: false,
        });
    }
};