import sha256 from "crypto-js/sha256";
import axios from "axios";
import { decryptSessionId } from "@/utils/encryptSessionAlgorithm";
import prisma from '@/lib/prisma';

export default async function POST(req, res) {
  const { id } = req.query;
  const sessionId = req.query.session;
  const decryptSession = decryptSessionId(sessionId)
  // check if session is valid

  // console.log("userData", userData)
  const userData = await prisma.User.findUnique({
    where: {
      id: decryptSession
    }
  })

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
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${id}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": merchantId,
    },
  };

  try {
    const response = await axios.request(options);
    console.log("respponse data", response.data.data.merchantTransactionId)
    console.log("respponse data", response.data)
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

      // Add Payment details to the database

      const createPayment = await prisma.PaymentHistory.create({
        data: {
          transactionId: response.data.data.transactionId,
          userId: userData.id,
          userName: userData.name,
          emailId: userData.email,
          planName: "Free",  //to be added with actual plan
          creditPoints: 200, //to be added with actual plan
          createdAt: currentDate,
          amount: response.data.data.amount / 100,
          currency: 'INR',//to be added with actual plan         
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
          planName: "Free",  //to be added with actual plan
          creditPoints: {
            increment: 200 // Increment the existing creditPoints by 200, change this value accordingly
          },
          remainingPoints: {
            increment: 200 // Increment the existing remainingPoints by 200, change this value accordingly
          },
          createdAt: currentDate,
          expiredAt: expiryISOString,        
        },
        create: {
          transactionId: response.data.data.transactionId,
          userId: userData.id,
          userName: userData.name,
          emailId: userData.email,
          planName: "Free",  //to be added with actual plan
          creditPoints: 200, //to be added with actual plan        
          remainingPoints: 100, //to be added with actual plan    
          createdAt: currentDate,
          expiredAt: expiryISOString,
          status: response.data.code,
          amount: response.data.data.amount / 100,
          currency: 'INR',//to be added with actual plan         
          paymentStatus: response.data.code,
          merchantId: response.data.data.merchantId,
          merchantTransactionId: response.data.data.merchantTransactionId,
          paymentInstrument: response.data.data.paymentInstrument,
        }
      });


      console.log("create plan", createPlan)





      res.writeHead(301, { Location: "http://localhost:3000/dashboard" });
      res.end();
    } else {
      res.writeHead(301, { Location: "http://localhost:3000/failure" });
      res.end();
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }


}


// }
