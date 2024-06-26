import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import { NextResponse } from 'next/server'
import LemonSqueezy from '@lemonsqueezy/lemonsqueezy.js'

const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY)

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)


  const variantId = req.body.variantId
  if (!session) {
    // Signed in
    res.status(200).json({ message: "You are not Authorised" })
  }
  if (session) {
    // Signed in
    const attributes = {
      'checkout_data': {
        'custom': {
          'email': session.user.email, // Displays in the checkout form
          'user_id': session.user.id // Sent in the background; visible in webhooks and API calls
        }
      },
      'product_options': {
        'enabled_variants': [variantId], // Only show the selected variant in the checkout
        'redirect_url': `${process.env.NEXTAUTH_URL}/dashboard/`,
        'receipt_link_url': `${process.env.NEXTAUTH_URL}/dashboard/`,
        'receipt_button_text': 'Go to your account',
        'receipt_thank_you_note': 'Thank you for purchase Picfix.ai!'
      }
    }
    try {
      const checkout = await ls.createCheckout({
        storeId: process.env.LEMONSQUEEZY_STORE_ID,
        variantId: variantId,
        attributes
      })

      return res.json({ 'error': false, 'url': checkout['data']['attributes']['url'] }, { status: 200 })
    }
    catch (e) {
      return res.json({ 'error': true, 'message': e.message }, { status: 400 })
    }
  }

}

