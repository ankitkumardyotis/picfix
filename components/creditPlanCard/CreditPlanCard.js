import React, { useEffect, useState } from 'react';
import styles from './CreditPlanCard.module.css';
import { LemonSqueezy } from '@lemonsqueezy/lemonsqueezy.js';
import { useRouter } from 'next/router';
import { useSession, signOut } from "next-auth/react"
import CircularProgress from '@mui/material/CircularProgress';

function CreditPlanCard() {
    const [product, setProduct] = useState(null);
    const router = useRouter();
    const { data: session } = useSession()


    useEffect(() => {
        const ls = new LemonSqueezy(process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY);

        const fetchProductInfo = async () => {
            try {
                const product = await ls.getVariants();
                setProduct(product);

            } catch (error) {
                console.error('Error fetching product info:', error);
            }
        };

        fetchProductInfo();
    }, []);
    console.log("product", product)

    const successPaymentHandler = async (variantId) => {
        const ls = new LemonSqueezy(process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY);


        try {

            if (!session) {
                router.push('/login')

            }

            if (session) {
                const res = await fetch('/api/checkouts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Specify content type as JSON
                    },
                    body: JSON.stringify({
                        variantId: variantId
                    })
                });

                const result = await res.json();

                if (result.error) {
                    alert(result.message)
                } else {
                    // ls.Url.Open(checkout.url)
                    // LemonSqueezy.Url.Open(result.url)
                    router.push(result.url)
                }
            }

        } catch (error) {
            console.error('Error creating checkout:', error);
            // Handle error if necessary
        }
    };

    return (
        <div className={styles.creditCardPlan} >
            <div className={styles.cardTitle} style={{ paddingTop: '6em' }}>
                <span>Credit Plans</span>
                <p style={{ marginTop: '3em' }}>Welcome to our pricing section, where simplicity meets value. We believe in offering straightforward pricing options that cater to your specific needs. <br /> Whether you're an individual looking to enhance your photos</p>
            </div>
            <div className={styles.cardContainer}>
                {product && product?.data?.length > 0 ?
                    product?.data?.map((item, index) => {


                        if (item.attributes.name === 'Default') return null

                        return <div key={index} className={styles.card} onClick={() => successPaymentHandler(item.id)}>
                            <h1>{Math.floor((item.attributes.price) / 100) / 2 + .5} Credits</h1>
                            <h4>({item.attributes.name})</h4>
                            {/* {item.attributes.description} */}
                            <p style={{ marginTop: '.2em' }}>credits will expire in 1 {item.attributes.interval} </p>
                            <br />
                            <hr />
                            <br />
                            <ul>
                                <li> Approx ₹14/Credit </li>
                                <li>
                                    1 Credit per year
                                </li>
                                <li>
                                    Paid Credits
                                </li>
                                <li>
                                    Can be used to activate Analytics plan
                                </li>
                                <li>
                                    Can be used for all Models
                                </li>
                            </ul>
                            <hr />

                            <span className={styles.price}>

                                <h1>${item.attributes.price / 100}</h1>
                                <p>(Incl. 18% GST)</p>

                            </span>

                        </div>
                    }) :
                    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                    </div>
                }
            </div>
        </div>
    )
}

export default CreditPlanCard








































// import React, { useEffect, useState } from 'react';
// import styles from './CreditPlanCard.module.css';
// import { LemonSqueezy } from '@lemonsqueezy/lemonsqueezy.js';
// import { useRouter } from 'next/router';
// import { useSession, signOut } from "next-auth/react"

// function CreditPlanCard() {
//     const [product, setProduct] = useState(null);
//     const router = useRouter();
//     const { data: session } = useSession()


//     useEffect(() => {
//         const ls = new LemonSqueezy(process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY);

//         const fetchProductInfo = async () => {
//             try {
//                 const product = await ls.getVariants();
//                 setProduct(product);

//             } catch (error) {
//                 console.error('Error fetching product info:', error);
//             }
//         };

//         fetchProductInfo();
//     }, []);
//     console.log("product", product?.data?.length)

//     const successPaymentHandler = async () => {
//         try {

//             if (!session) {
//                 router.push('/login')

//             }

//             if (session) {
//                 const ls = new LemonSqueezy(process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY);
//                 const res = await fetch('/api/checkouts', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json' // Specify content type as JSON
//                     },
//                     body: JSON.stringify({
//                         variantId: 236484
//                     })
//                 });

//                 const result = await res.json();
//                 console.log("Response from server:", result.url);

//                 if (result.error) {
//                     alert(result.message)
//                 } else {
//                     // ls.Url.Open(checkout.url)
//                     // LemonSqueezy.Url.Open(result.url)
//                     router.push(result.url)
//                 }
//             }

//         } catch (error) {
//             console.error('Error creating checkout:', error);
//             // Handle error if necessary
//         }
//     };

//     return (
//         <div className={styles.creditCardPlan}>
//             <div className={styles.cardTitle}>
//                 <span>Credit Plans</span>
//             </div>
//             <div className={styles.cardContainer}>

//                 <div className={styles.card} onClick={successPaymentHandler}>
//                     <h1>50 Credits</h1>
//                     <p>Unused credits will expire in 1 Month</p>
//                     <br />
//                     <hr />
//                     <br />
//                     <ul>
//                         <li> Approx ₹14/Credit </li>
//                         <li>

//                             1 Credit per year

//                         </li>
//                         <li>
//                             Paid Credits

//                         </li>
//                         <li>

//                             Can be used to activate Analytics plan
//                         </li>

//                         <li>

//                             Can be used for all Models
//                         </li>
//                     </ul>
//                     <hr />

//                     <span className={styles.price}>

//                         <h1>₹{Math.floor(product?.data[1]?.attributes?.price) / 100}</h1>
//                         <p>(Incl. 18% GST)</p>

//                     </span>

//                 </div>
//                 <div className={styles.card} onClick={successPaymentHandler}>
//                     <h1>100 Credits</h1>
//                     <p>Unused credits will expire in 1 Month</p>
//                     <br />

//                     <hr />
//                     <br />
//                     <ul>
//                         <li> Approx ₹14/Credit </li>
//                         <li>

//                             1 Credit per year

//                         </li>
//                         <li>
//                             Paid Credits

//                         </li>
//                         <li>

//                             Can be used to activate Analytics plan
//                         </li>

//                         <li>
//                             Can be used for all Models
//                         </li>
//                     </ul>
//                     <hr />
//                     <span className={styles.price}>

//                         <h1>₹{Math.floor(product?.data[2]?.attributes?.price) / 100}</h1>
//                         <p>(Incl. 18% GST)</p>

//                     </span>

//                 </div>
//                 <div className={styles.card}>
//                     <h1>150 Credits</h1>
//                     <p>Unused credits will expire in 1 Month</p>
//                     <br />

//                     <hr />
//                     <br />
//                     <ul>
//                         <li> Approx ₹14/Credit </li>
//                         <li>

//                             1 Credit per year

//                         </li>
//                         <li>
//                             Paid Credits

//                         </li>
//                         <li>

//                             Can be used to activate Analytics plan
//                         </li>

//                         <li>
//                             Can be used for all Models
//                         </li>
//                     </ul>
//                     <hr />
//                     <span className={styles.price}>

//                         <h1>₹1999</h1>
//                         <p>(Incl. 18% GST)</p>

//                     </span>

//                 </div>
//                 <div className={styles.card}>
//                     <h1>250 Credits</h1>
//                     <p>Unused credits will expire in 1 Month</p>
//                     <br />
//                     <hr />
//                     <br />
//                     <ul>
//                         <li> Approx ₹14/Credit </li>
//                         <li>
//                             1 Credit per year
//                         </li>
//                         <li>
//                             Paid Credits
//                         </li>
//                         <li>
//                             Can be used to activate Analytics plan
//                         </li>

//                         <li>
//                             Can be used for all Models
//                         </li>
//                     </ul>
//                     <hr />
//                     <span className={styles.price}>

//                         <h1>₹2999</h1>
//                         <p>(Incl. 18% GST)</p>

//                     </span>

//                 </div>
//             </div>
//         </div>
//     )
// }

// export default CreditPlanCard