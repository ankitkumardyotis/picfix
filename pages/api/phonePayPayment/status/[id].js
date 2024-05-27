import sha256 from "crypto-js/sha256";
import axios from "axios";
import { decryptSessionId } from "@/utils/encryptSessionAlgorithm";
import prisma from '@/lib/prisma';
import { priceStructure } from "@/constant/Constant";

export default async function POST(req, res) {
  const { id } = req.query;
  const sessionId = req.query.session;
  const decryptSession = decryptSessionId(sessionId)
  // check if session is valid

  const userData = await prisma.User.findUnique({
    where: {
      id: decryptSession
    }
  })
  console.log("userData in status id", userData)
  
  if (!userData) {
    res.status(401).json({ message: "You are not Authorised" })
    return;
  }
  const merchantId = process.env.MERCHANT_ID;
  const st =
    `/pg/v1/status/${merchantId}/${id}` +
    process.env.SALT_KEY;
  const dataSha256 = sha256(st);

  const checksum = dataSha256 + "###" + process.env.SALT_INDEX;

  const options = {
    method: "GET",
    url: `${process.env.PHONEPAY_STATUS_URL}/${merchantId}/${id}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": merchantId,
    },
  };

  try {
    const response = await axios.request(options);
    if (response.data.code === "PAYMENT_SUCCESS") {
      // const data = {
      //   transactionId: response.data.data.transactionId,
      //   userId: userData.id,
      //   userName: userData.name,
      //   emailId: userData.email,
      //   planName: "Free",  //to be added with actual plan
      //   creditPoints: 200, //to be added with actual plan        
      //   remainingPoints: 100, //to be added with actual plan    
      //   createdAt: new Date(),
      //   expiredAt: new Date(), //to be added with actual plan
      //   status: response.data.code,
      //   amount: response.data.data.amount,
      //   currency: 'INR',//to be added with actual plan         
      //   paymentStatus: response.data.code,
      //   merchantId: response.data.data.merchantId,
      //   merchantTransactionId: response.data.data.merchantTransactionId,
      //   paymentInstrument: response.data.data.paymentInstrument,
      // }
      // Get the current date
      const currentDate = new Date();

      // Add one year to the current date
      const expiryDate = new Date(currentDate);
      expiryDate.setFullYear(currentDate.getFullYear() + 1);

      // Convert expiry date to ISO string format
      const expiryISOString = expiryDate.toISOString();

      console.log("Current Date:", currentDate.toISOString());
      console.log("Expiry Date:", expiryISOString);

      // Create a plan details object
      const currency = "INR";
      const [planDetails] = priceStructure.filter((item) => item.currency === currency && item.price == (response.data.data.amount / 100))

      // Add Payment details to the database

      const createPayment = await prisma.PaymentHistory.create({
        data: {
          transactionId: response.data.data.transactionId,
          userId: userData.id,
          userName: userData.name,
          emailId: userData.email,
          planName: planDetails.name,  //to be added with actual plan
          creditPoints: parseInt(planDetails.creditPoints), //to be added with actual plan
          createdAt: currentDate,
          amount: response.data.data.amount / 100,
          currency: planDetails.currency,//to be added with actual plan         
          paymentStatus: response.data.code,
          merchantId: response.data.data.merchantId,
          merchantTransactionId: response.data.data.merchantTransactionId,
          paymentInstrument: response.data.data.paymentInstrument,
        }
      })


      const createPlan = await prisma.Plan.upsert({
        where: {
          userId: userData.id // Assuming userId is unique and identifies the user uniquely
        },
        update: {
          userName: userData.name,
          emailId: userData.email,
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
          userId: userData.id,
          userName: userData.name,
          emailId: userData.email,
          planName: planDetails.name,  //to be added with actual plan
          creditPoints: parseInt(planDetails.creditPoints), //to be added with actual plan        
          remainingPoints: parseInt(planDetails.creditPoints), //to be added with actual plan    
          createdAt: currentDate,
          expiredAt: expiryISOString,
        }
      });


      console.log("create plan", createPlan)





      res.writeHead(301, { Location: `${process.env.NEXTAUTH_URL}/dashboard` });
      res.end();
    } else {
      res.writeHead(301, { Location:  `${process.env.NEXTAUTH_URL}/failed` });
      res.end();
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }


}


// }
