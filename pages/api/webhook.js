const crypto = require('crypto');
// import prisma from '@/lib/prisma'
import LemonSqueezy from '@lemonsqueezy/lemonsqueezy.js';
import prisma from '@/lib/prisma';

// Your webhook secret key
const secretKey = 'picfixwebsecret';

export const config = {
    api: {
        bodyParser: false,
    },
};
const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY)

async function getRawBody(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}
async function processEvent(event) {

    let processingError = ''

    const customData = event.body['meta']['custom_data'] || null

    if (!customData || !customData['user_id']) {

        processingError = 'No user ID, can\'t process'

    }
    else {
        const obj = event.body['data']
        let onSuccessPaymentData = {};
        const orderData = obj['attributes']
        console.log("  creditPoints:", customData['credit_points'],)
        if (event.eventName.startsWith("subscription_payment_success")) {

            const subscriptionDetails = await ls.getSubscription({ id: orderData['subscription_id'] })
            const subDetail = subscriptionDetails['data']['attributes']

            let creditPoints = 0;
            // This is standard pricing for the time being
            if (subDetail['variant_id'] === 236484) {
                creditPoints = 300;
            }

            // This is Premium pricing for the time being
            if (subDetail['variant_id'] === 236488) {
                creditPoints = 500;
            }

            // This is Popular pricing for the time being
            if (subDetail['variant_id'] === 236489) {
                creditPoints = 800;
            }
            // when user create checkout successful 
            const createSubscription = await prisma.subscription.create({
                data: {
                    lemonSqueezyId: orderData['subscription_id'],
                    name: orderData['user_name'],
                    email: customData['email'],
                    user: {
                        connect: {
                            id: customData['user_id']
                        }
                    },
                    orderId: subDetail['order_id'],
                    variantId: subDetail['variant_id'],
                    productName: subDetail['product_name'],
                    variantName: subDetail['variant_name'],
                    cardLastFour: parseInt(subDetail['card_last_four']),
                    cardBrand: subDetail['card_brand'],
                    planId: customData['user_id'],
                    orderId: subDetail['order_id'],
                    createdAt: subscriptionDetails['data']['attributes']['created_at'],
                    currency: orderData['currency'],
                    price: orderData['total_formatted'],
                    creditPoints: creditPoints,
                    status: orderData['status'],
                }
            })

            // then create plan for user
            const expiredAt = new Date(subscriptionDetails['data']['attributes']['created_at']);
            expiredAt.setMonth(expiredAt.getMonth() + 3);

            const createPlan = await prisma.plan.create({
                data: {
                    lemonSqueezyId: orderData['subscription_id'],
                    variantId: subDetail['variant_id'] || null, // Ensure variantId is not null or undefined
                    name: subDetail['user_name'],
                    userId: customData['user_id'],
                    variantName: subDetail['variant_name'],
                    status: 'active',
                    creditPoints: creditPoints,
                    createdAt: subDetail['created_at'],
                    expiredAt: expiredAt,
                    renewAt: expiredAt,
                    userName: subDetail['user_name'],
                }
            }).catch(err => {
                console.error('Error creating Plan:', err);
            });
        }
    }
}
export default async function POST(req, res) {

    if (req.method === 'POST') {
        // Extract the payload and signature from the request
        const rawBody = await getRawBody(req);
        // console.log("req", req)
        const eventType = req.headers['x-event-name'];

        // const secret = 'picfixwebsecret';
        const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');

        const signature = Buffer.from(req.headers["x-signature"].toString() || '', 'utf8');

        if (!crypto.timingSafeEqual(digest, signature)) {
            throw new Error('Invalid signature.');
        }
        else {
            // if (eventType === "order_created") {
            //   add order to database
            const eventData = JSON.parse(rawBody)
            const event = await prisma.webhookEvent.create({
                data: {
                    eventName: eventData['meta']['event_name'],
                    body: eventData
                },
            })
            processEvent(event)
            // }
        }
        return res.status(200).json({ message: 'Webhook received by localhost' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}






























// const addDataOnSuccessPaymentCreated = await prisma.subscription.create({
//     data: {
//         lemonSqueezyId: subscriptionId,
//         name: orderData['user_name'],
//         email: customData['email'],
//         user: {
//             connect: {
//                 id: customData['user_id']
//             }
//         },
//         orderId: orderData['order_id'],
//         variantId: orderData['variant_id'],
//         productName: orderData['product_name'],
//         variantName: orderData['variant_name'],
//         cardLastFour: parseInt(orderData['card_last_four']),
//         cardBrand: orderData['card_brand'],
//         planId: customData['user_id']
//     }
// });















































































// const crypto = require('crypto');
// // import prisma from '@/lib/prisma'
// import { PrismaClient } from '@prisma/client'

// // Your webhook secret key
// const secretKey = 'picfixwebsecret';

// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };
// const prisma = new PrismaClient()


// async function getRawBody(readable) {
//     const chunks = [];
//     for await (const chunk of readable) {
//         chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
//     }
//     return Buffer.concat(chunks);
// }
// async function processEvent(event) {

//     let processingError = ''

//     const customData = event.body['meta']['custom_data'] || null

//     if (!customData || !customData['user_id']) {

//         processingError = 'No user ID, can\'t process'

//     }
//     else {
//         const obj = event.body['data']
//         let onSuccessPaymentData = {};
//         let onSuccessPaymentDataCreated = {};
//         const orderData = obj['attributes']
//         if (event.eventName.startsWith("subscription_created")) {
//             const subscriptionId = orderData['first_subscription_item']['subscription_id']

//             onSuccessPaymentDataCreated = {
//                 lemonSqueezyId: subscriptionId,
//                 name: orderData['user_name'],
//                 email: customData['email'],
//                 userId: customData['user_id'],
//                 orderId: orderData['order_id'],
//                 variantId: orderData['variant_id'],
//                 productName: orderData['product_name'],
//                 variantName: orderData['variant_name'],
//                 cardLastFour: orderData['card_last_four'],
//                 cardBrand: orderData['card_brand'],
//             }
//             const addDataOnSuccessPaymentCreated = await prisma.subscription.create({
//                 data: {
//                     lemonSqueezyId: subscriptionId,
//                     name: orderData['user_name'],
//                     email: customData['email'],
//                     user: {
//                         connect: {
//                             id: customData['user_id']
//                         }
//                     },
//                     orderId: orderData['order_id'],
//                     variantId: orderData['variant_id'],
//                     productName: orderData['product_name'],
//                     variantName: orderData['variant_name'],
//                     cardLastFour: parseInt(orderData['card_last_four']),
//                     cardBrand: orderData['card_brand'],
//                     planId: customData['user_id']
//                 }
//             });






//             console.log("addDataOnSuccessPaymentCreated prisma", addDataOnSuccessPaymentCreated)
//         }

//         if (event.eventName.startsWith("subscription_payment_success")) {
//             console.log("onSuccessPaymentDataCreated in subscription_payment_success", onSuccessPaymentDataCreated)
//             onSuccessPaymentData = {
//                 name: orderData['user_name'],
//                 email: customData['email'],
//                 status: orderData['status'],
//                 userId: customData['user_id'],
//                 price: orderData['total'],
//                 card_last_four: orderData['card_last_four'],
//                 card_brand: orderData['card_brand'],
//                 subscriptionId: orderData['subscription_id'],
//             }
//             console.log("update created checkout subs", onSuccessPaymentData)

//             const addDataOnSuccessPayment = await prisma.subscription.upsert({
//                 where: {
//                     lemonSqueezyId: orderData['subscription_id'],
//                     userId: customData['user_id'],
//                 },
//                 update: {
//                     status: orderData['status'],
//                     price: orderData['total'],
//                     cardLastFour: parseInt(orderData['card_last_four']),
//                     cardBrand: orderData['card_brand'],
//                 },
//                 create: {
//                     lemonSqueezyId: orderData['subscription_id'],
//                     name: orderData['user_name'],
//                     email: customData['email'],
//                     user: {
//                         connect: {
//                             id: customData['user_id']
//                         }
//                     },
//                     orderId: orderData['order_id'],
//                     variantId: orderData['variant_id'],
//                     productName: orderData['product_name'],
//                     variantName: orderData['variant_name'],
//                     cardLastFour: parseInt(orderData['card_last_four']),
//                     cardBrand: orderData['card_brand'],
//                     planId: customData['user_id'],
//                     orderId: orderData['order_id'],
//                 }
//             })



//             console.log("addDataOnSuccessPaymentfirst", addDataOnSuccessPayment)

//         }




//         // console.log("first log addDataOnSuccessPayment", onSuccessPaymentData)
//         console.log(" onSuccessPaymentDataCreated", onSuccessPaymentDataCreated)

//         // if (event.eventName.startsWith('subscription_payment_success')) {
//         //     // Save subscription invoices; obj is a "Subscription invoice"




//         //     /* Not implemented */

//         // } else if (event.eventName.startsWith('subscription_')) {
//         //     // Save subscriptions; obj is a "Subscription"

//         //     const data = obj['attributes']

//         //     // We assume the Plan table is up to date
//         //     const plan = await prisma.plan.findUnique({
//         //         where: {
//         //             variantId: data['variant_id']
//         //         },
//         //     })


//         //     if (!plan) {

//         //         processingError = 'Plan not found in DB. Could not process webhook event.'

//         //     }
//         //     else {

//         //         // Update the subscription

//         //         const lemonSqueezyId = parseInt(obj['id'])

//         //         // Get subscription's Price object
//         //         // We save the Price value to the subscription so we can display it in the UI
//         //         let priceData = await ls.getPrice({ id: data['first_subscription_item']['price_id'] })

//         //         const updateData = {
//         //             orderId: data['order_id'],
//         //             name: data['user_name'],
//         //             email: data['user_email'],
//         //             status: data['status'],
//         //             renewsAt: data['renews_at'],
//         //             endsAt: data['ends_at'],
//         //             trialEndsAt: data['trial_ends_at'],
//         //             planId: plan['id'],
//         //             userId: customData['user_id'],
//         //             price: priceData['data']['attributes']['unit_price'],
//         //             subscriptionItemId: data['first_subscription_item']['id'],
//         //             // Save this for usage-based billing reporting; no need to if you use quantity-based billing
//         //             isUsageBased: data['first_subscription_item']['is_usage_based'],
//         //         }

//         //         const createData = updateData
//         //         createData.lemonSqueezyId = lemonSqueezyId
//         //         createData.price = plan.price

//         // try {
//         //     // Create/update subscription
//         //     await prisma.subscription.upsert({
//         //         where: {
//         //             lemonSqueezyId: lemonSqueezyId
//         //         },
//         //         update: updateData,
//         //         create: createData,
//         //     })
//         // } catch (error) {
//         //     processingError = error
//         //     console.log(error)
//         // }





//     }


// }
// export default async function POST(req, res) {

//     if (req.method === 'POST') {
//         // Extract the payload and signature from the request
//         const rawBody = await getRawBody(req);
//         // console.log("req", req)
//         const eventType = req.headers['x-event-name'];

//         const secret = 'picfixwebsecret';
//         const hmac = crypto.createHmac('sha256', secret);
//         const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');

//         const signature = Buffer.from(req.headers["x-signature"].toString() || '', 'utf8');

//         if (!crypto.timingSafeEqual(digest, signature)) {
//             throw new Error('Invalid signature.');
//         }
//         else {
//             // if (eventType === "order_created") {
//             //   add order to database
//             const eventData = JSON.parse(rawBody)
//             const event = await prisma.webhookEvent.create({
//                 data: {
//                     eventName: eventData['meta']['event_name'],
//                     body: eventData
//                 },
//             })
//             processEvent(event)
//             // }
//         }
//         return res.status(200).json({ message: 'Webhook received by localhost' });
//     } else {
//         res.setHeader('Allow', ['POST']);
//         res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
// }
