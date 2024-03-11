console.log("process", process.env.NEXT_PUBLIC_STANDARD_VARIANT_PRICE_IN)

const inrPrice = {
    standard: {
        price: process.env.NEXT_PUBLIC_STANDARD_VARIANT_PRICE_IN,
        creditPoints: process.env.NEXT_PUBLIC_STANDARD_CREDIT_POINTS_IN
    },
    popular: {
        price: process.env.NEXT_PUBLIC_POPULAR_VARIANT_PRICE_IN,
        creditPoints: process.env.NEXT_PUBLIC_POPULAR_CREDIT_POINTS_IN
    },
    premium: {
        price: process.env.NEXT_PUBLIC_PREMIUM_VARIANT_PRICE_IN,
        creditPoints: process.env.NEXT_PUBLIC_PREMIUM_CREDIT_POINTS_IN
    },
}
const usPrice = {
    standard: {
        price: process.env.NEXT_PUBLIC_STANDARD_VARIANT_PRICE_US,
        creditPoints: process.env.NEXT_PUBLIC_STANDARD_CREDIT_POINTS_IN
    },
    popular: {
        price: process.env.NEXT_PUBLIC_POPULAR_VARIANT_PRICE_US,
        creditPoints: process.env.NEXT_PUBLIC_POPULAR_CREDIT_POINTS_IN
    },
    premium: {
        price: process.env.NEXT_PUBLIC_PREMIUM_VARIANT_PRICE_US,
        creditPoints: process.env.NEXT_PUBLIC_PREMIUM_CREDIT_POINTS_IN
    },
}


export { inrPrice, usPrice }



