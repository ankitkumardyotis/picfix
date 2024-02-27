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
      // 'checkout_options': {
      //   // 'embed': true,
      //   'media': true,
      //   'logo':true,
      //   'button_color': '#fde68a',
      //   "dark": true
      // },
      'checkout_data': {
        'custom': {
          'email': session.user.email, // Displays in the checkout form
          'user_id': session.user.id // Sent in the background; visible in webhooks and API calls
        }
      },
      'product_options': {
        'enabled_variants': [variantId], // Only show the selected variant in the checkout
        'redirect_url': `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/`,
        'receipt_link_url': `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/`,
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
      console.log(e.message)
      return res.json({ 'error': true, 'message': e.message }, { status: 400 })
    }
  }







  // res.end()
}


// import { getServerSession } from "next-auth/next"
// import { authOptions } from "../api/auth/[...nextauth]"
// import { useSession } from "next-auth/react"

// export default function Page() {
//   const { data: session } = useSession()
//   console.log("session in checkout", session)
//   if (typeof window === "undefined") return null

//   if (session) {
//     return (
//       <>
//         <h1>Protected Page</h1>
//         <p>You can view this page because you are signed in.</p>
//       </>
//     )
//   }
//   return <p>Access Denied</p>
// }

// export async function getServerSideProps(context) {
//   return {
//     props: {
//       session: await getServerSession(
//         context.req,
//         context.res,
//         authOptions
//       ),
//     },
//   }
// }



























// // // Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// // import { getSession } from "next-auth/react";
// // import { NextResponse } from "next/server";

// // export default async function handler(req, res) {
// //   const session = await getSession({req})
// //   console.log("session in checkout", session)
// //   // Check if the user is authenticated
// //   if (!session) {
// //     res.status(401).json({
// //       error: 'User is not authenticated',
// //     })
// //     return
// //   }

// //   if (session) {
// //     res.status(200).json({ error: "successful authorised" });
// //     return;
// //   }

// //   // Access session data
// //   console.log("User ID:", session.user.id);
// //   console.log("User email:", session.user.email);

// //   // Your logic here

// //   res.status(200).json({ message: "Success" });
// // }
