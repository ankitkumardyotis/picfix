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
        if (event.eventName.startsWith("subscription_payment_success")) {

            const subscriptionDetails = await ls.getSubscription({ id: orderData['subscription_id'] })
            const subDetail = subscriptionDetails['data']['attributes']

            let creditPoints = 0;
            // This is standard pricing for the time being 270344
            if (subDetail['variant_id'] === 270344) {
                creditPoints = 150;
            }

            // This is Popular pricing for the time being 270347
            if (subDetail['variant_id'] === 270347) {
                creditPoints = 400;
            }

            // This is Premium pricing for the time being  270349
            if (subDetail['variant_id'] === 270349) {
                creditPoints = 850;
            }
            // when user create checkout successful 
        await prisma.subscription.create({
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

            await prisma.plan.create({
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

























