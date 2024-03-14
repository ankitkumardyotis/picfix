import axios from 'axios'
import sha256 from 'crypto-js/sha256'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]"
import { decryptSessionId, encryptSessionId } from '@/utils/encryptSessionAlgorithm'

export default async function handler(req, res) {
    const { amount } = req.body
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
        res.status(401).json({ message: "You are not Authorised" })
        return;
    }

    const encryptSession = encryptSessionId(session.user.id)
    const transactionId = "MT-" + uuidv4().toString(36).slice(-6);
    const payload = {
        merchantId: process.env.MERCHANT_ID,
        merchantTransactionId: transactionId,
        merchantUserId: "MUID123",
        amount: amount * 100,
        redirectUrl: `http://localhost:3000/api/phonePayPayment/status/${transactionId}/?session=${encryptSession}`,
        redirectMode: "POST",
        callbackUrl: `http://localhost:3000/api/phonePayPayment/status/${transactionId}/?session=${encryptSession}`,
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    }

    const dataPayload = JSON.stringify(payload)
    const dataBase64 = Buffer.from(dataPayload).toString('base64')
    const fullUrl = dataBase64 + "/pg/v1/pay" + process.env.SALT_KEY;
    const dataSha256 = sha256(fullUrl)
    const checksum = dataSha256 + "###" + process.env.SALT_INDEX
    const response = await axios.post('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
        {
            request: dataBase64,
        },
        {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            }
        }
    ).catch((error) => {
        console.log("error", error)
        res.status(500).json({ error: error.message })
    })
    console.log("response", response.data)
    res.status(200).json({ url: response.data.data.instrumentResponse.redirectInfo.url, transactionId })
}
