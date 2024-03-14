const priceStructure=[
    {
        id:1,
        name: "standard",
        country: "IN",
        price: process.env.NEXT_PUBLIC_STANDARD_VARIANT_PRICE_IN,
        creditPoints: process.env.NEXT_PUBLIC_STANDARD_TOTAL_CREDIT_POINTS_IN,
        extraCreditPoints: process.env.NEXT_PUBLIC_STANDARD_EXTRA_CREDIT_POINTS_IN,
    },
    {
        id:2,
        name: "popular",
        country: "IN",
        price: process.env.NEXT_PUBLIC_POPULAR_VARIANT_PRICE_IN,
        creditPoints: process.env.NEXT_PUBLIC_POPULAR_TOTAL_CREDIT_POINTS_IN,
        extraCreditPoints: process.env.NEXT_PUBLIC_POPULAR_EXTRA_CREDIT_POINTS_IN,
    },
    {
        id:3,
        name: "premium",
        country: "IN",
        price: process.env.NEXT_PUBLIC_PREMIUM_VARIANT_PRICE_IN,
        creditPoints: process.env.NEXT_PUBLIC_PREMIUM_TOTAL_CREDIT_POINTS_IN,
        extraCreditPoints: process.env.NEXT_PUBLIC_PREMIUM_EXTRA_CREDIT_POINTS_IN,
    },
    {
        id:4,
        name: "standard",
        country: "US",
        price: process.env.NEXT_PUBLIC_STANDARD_VARIANT_PRICE_US,
        creditPoints: process.env.NEXT_PUBLIC_STANDARD_TOTAL_CREDIT_POINTS_US,
        extraCreditPoints: process.env.NEXT_PUBLIC_STANDARD_EXTRA_CREDIT_POINTS_US,
    },
    {
        id:5,
        name: "popular",
        country: "US",
        price: process.env.NEXT_PUBLIC_POPULAR_VARIANT_PRICE_US,
        creditPoints: process.env.NEXT_PUBLIC_POPULAR_TOTAL_CREDIT_POINTS_US,
        extraCreditPoints: process.env.NEXT_PUBLIC_POPULAR_EXTRA_CREDIT_POINTS_US,
    },
    {
        id:6,
        name: "premium",
        country: "US",
        price: process.env.NEXT_PUBLIC_PREMIUM_VARIANT_PRICE_US,
        creditPoints: process.env.NEXT_PUBLIC_PREMIUM_TOTAL_CREDIT_POINTS_US,
        extraCreditPoints: process.env.NEXT_PUBLIC_PREMIUM_EXTRA_CREDIT_POINTS_US
    }
]



// const inrPrice = {
//     standard: {
//         price: process.env.NEXT_PUBLIC_STANDARD_VARIANT_PRICE_IN,
//         creditPoints: process.env.NEXT_PUBLIC_STANDARD_TOTAL_CREDIT_POINTS_IN,
//         extraCreditPoints: process.env.NEXT_PUBLIC_STANDARD_EXTRA_CREDIT_POINTS_IN,

//     },
//     popular: {
//         price: process.env.NEXT_PUBLIC_POPULAR_VARIANT_PRICE_IN,
//         creditPoints: process.env.NEXT_PUBLIC_POPULAR_TOTAL_CREDIT_POINTS_IN,
//         extraCreditPoints: process.env.NEXT_PUBLIC_POPULAR_EXTRA_CREDIT_POINTS_IN,
//     },
//     premium: {
//         price: process.env.NEXT_PUBLIC_PREMIUM_VARIANT_PRICE_IN,
//         creditPoints: process.env.NEXT_PUBLIC_PREMIUM_TOTAL_CREDIT_POINTS_IN,
//         extraCreditPoints: process.env.NEXT_PUBLIC_PREMIUM_EXTRA_CREDIT_POINTS_IN,
//     },
// }
// const usPrice = {
//     standard: {
//         price: process.env.NEXT_PUBLIC_STANDARD_VARIANT_PRICE_US,
//         creditPoints: process.env.NEXT_PUBLIC_STANDARD_TOTAL_CREDIT_POINTS_US,
//         extraCreditPoints: process.env.NEXT_PUBLIC_STANDARD_EXTRA_CREDIT_POINTS_US,
//     },
//     popular: {
//         price: process.env.NEXT_PUBLIC_POPULAR_VARIANT_PRICE_US,
//         creditPoints: process.env.NEXT_PUBLIC_POPULAR_TOTAL_CREDIT_POINTS_US,
//         extraCreditPoints: process.env.NEXT_PUBLIC_POPULAR_EXTRA_CREDIT_POINTS_US,
//     },
//     premium: {
//         price: process.env.NEXT_PUBLIC_PREMIUM_VARIANT_PRICE_US,
//         creditPoints: process.env.NEXT_PUBLIC_PREMIUM_TOTAL_CREDIT_POINTS_US,
//         extraCreditPoints: process.env.NEXT_PUBLIC_PREMIUM_EXTRA_CREDIT_POINTS_US
//     },
// }


export { priceStructure}



