import React, { useEffect, useState } from "react";
import styles from "./CreditPlanCard.module.css";
import { LemonSqueezy } from "@lemonsqueezy/lemonsqueezy.js";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { priceStructure } from "../../constant/Constant";
function CreditPlanCard() {
    const [product, setProduct] = useState(null);
    const router = useRouter();
    const { data: session } = useSession();
    const [countryLocation, setCountryLocation] = useState("");
    const [priceDetails, setPriceDetails] = useState([]);
    const [conversionRate, setConversionrate] = useState();

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up("md"));

    const fetchUserLocation = async () => {
        await fetch("https://ipapi.co/json/")
            .then((response) => response.json())
            .then((data) => {
                const country = data.country;
                // Check if country is US and render price accordingly
                setCountryLocation(country);
                if (country === "IN") {
                    const inrPrice = priceStructure.filter((item) => item.country === "IN")
                    setPriceDetails(inrPrice);
                } else {
                    const usPrice = priceStructure.filter((item) => item.country === "US")
                    setPriceDetails(usPrice);
                }
            })
            .catch((error) => console.error("Error fetching IP geolocation:", error));
        // Setting URL
        const url_str =
            "https://v6.exchangerate-api.com/v6/ef1fc8abb23f6d2e3dabbbc2/latest/USD";

        // Making Request
        fetch(url_str)
            .then((response) => {
                // Check if the response is successful
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                const req_result = data;
                setConversionrate(req_result.conversion_rates.INR);
            })
            .catch((error) => {
                console.error("There was a problem with the fetch operation:", error);
            });
    };

    useEffect(() => {
        fetchUserLocation();
    }, []);

    const successPaymentHandler = async (price) => {
        try {
            if (!session) {
                router.push("/login");
            }

            if (session) {
                const response = await fetch("/api/phonePayPayment/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ amount: price }),
                });
                console.log("price", price)
                const { url } = await response.json();
                console.log("url", url)
                router.push(url);
            }
        } catch (error) {
            console.error("Error creating checkout:", error);
            // Handle error if necessary
        }
    };
    return (
        <div className={styles.creditCardPlan}>
            <div className={styles.cardTitle} style={{ paddingTop: "6em" }}>
                <span>Credit Plans</span>
                <p style={{ marginTop: "3em", padding: "0.3rem 1.5rem" }}>
                    Welcome to our pricing section, where simplicity meets value. We
                    believe in offering straightforward pricing options that cater to your
                    specific needs.{matches && <br />} Whether you're an individual
                    looking to enhance your photos
                </p>
            </div>
            <div
                className={styles.cardContainer}
                style={{
                    flexDirection: !matches && "column",
                    padding: !matches && "0.3rem 1rem",
                }}
            >
                {
                    priceDetails.map((item, idx) => {
                        return (
                            <div
                            key={idx}
                                className={styles.card}
                                style={{
                                    border: "1px solid teal",
                                }}
                                onClick={() => successPaymentHandler(item.price)}
                            >
                                <h1>{item.creditPoints} Credits</h1>

                                {item.name === 'premium' && <div className={styles.ribbon}>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        {" "}
                                        <span>⭐⭐⭐</span>
                                        <span>Premium</span>{" "}
                                    </div>
                                </div>
                                }
                                {item.name === 'popular' && <div className={styles.ribbon}>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        {" "}
                                        <span>⭐⭐</span>
                                        <span>Popular</span>{" "}
                                    </div>
                                </div>
                                }
                                {/* {item.attributes.name === 'Premium' && <div className={styles.ribbon}> Premium</div>} */}
                                <br />
                                <hr />
                                <br />
                                <ul>
                                    <li>{item.creditPoints - item.extraCreditPoints} Photo Credits</li>
                                    {item.extraCreditPoints != 0 && <li>+{item.extraCreditPoints} Credits Extra</li>}
                                    <li> Free Remove Background </li>
                                    <li>1 Credit used per model</li>
                                    <li>Access of all Models</li>
                                    <li>Credits will expire in 1 year</li>
                                    {item.extraCreditPoints == 0 && <><br /> <br /></>}
                                    {/* <li>
                            Can be used to activate Analytics plan
                            </li>
                        <li>
                            Can be used for all Models
                        </li> */}
                                </ul>
                                <hr />

                                <span className={styles.price}>
                                    {/* {countryLocation === 'IN' ? <h1>₹{(item.attributes.price / 100) * conversionRate}</h1> : <h1>${item.attributes.price / 100}</h1>} */}
                                    <h1>{item.country === 'IN' ? '₹' : '$'}{item.price}</h1>
                                    {/* <p>(Incl. 18% GST)</p> */}
                                </span>
                            </div>
                        )
                    })
                }



            </div>
        </div>
    );
}

export default CreditPlanCard;









// <div
// className={styles.card}
// style={{
//     border: "1px solid teal",
// }}
// onClick={successPaymentHandler}
// >
// <h1>150 Credits</h1>

// <div className={styles.ribbon}>
//     <div style={{ display: "flex", flexDirection: "column" }}>
//         {" "}
//         <span>⭐⭐⭐</span>
//         <span>Premium</span>{" "}
//     </div>
// </div>

// {/* {item.attributes.name === 'Premium' && <div className={styles.ribbon}> Premium</div>} */}
// <br />
// <hr />
// <br />
// <ul>
//     <li>375 Photo Credits</li>
//     <li>+25 Credits Extra</li>
//     <li> Free Remove Background </li>
//     <li>1 Credit used per model</li>
//     <li>Access of all Models</li>
//     <li>Credits will expire in 1 year</li>
// </ul>
// <hr />

// <span className={styles.price}>
//     {/* {countryLocation === 'IN' ? <h1>₹{(item.attributes.price / 100) * conversionRate}</h1> : <h1>${item.attributes.price / 100}</h1>} */}
//     <h1>₹1999</h1>
//     {/* <p>(Incl. 18% GST)</p> */}
// </span>
// </div>
// <div
// className={styles.card}
// style={{
//     border: "1px solid teal",
// }}
// onClick={successPaymentHandler}
// >
// <h1>150 Credits</h1>

// <div className={styles.ribbon}>
//     <div style={{ display: "flex", flexDirection: "column" }}>
//         {" "}
//         <span>⭐⭐⭐</span>
//         <span>Premium</span>{" "}
//     </div>
// </div>

// {/* {item.attributes.name === 'Premium' && <div className={styles.ribbon}> Premium</div>} */}
// <br />
// <hr />
// <br />
// <ul>
//     <li>375 Photo Credits</li>
//     <li>+25 Credits Extra</li>
//     <li> Free Remove Background </li>
//     <li>1 Credit used per model</li>
//     <li>Access of all Models</li>
//     <li>Credits will expire in 1 year</li>
//     {/* <li>
//                 Can be used to activate Analytics plan
//                 </li>
//             <li>
//                 Can be used for all Models
//             </li> */}
// </ul>
// <hr />

// <span className={styles.price}>
//     {/* {countryLocation === 'IN' ? <h1>₹{(item.attributes.price / 100) * conversionRate}</h1> : <h1>${item.attributes.price / 100}</h1>} */}
//     <h1>₹1999</h1>
//     {/* <p>(Incl. 18% GST)</p> */}
// </span>
// </div>


































// import React, { useEffect, useState } from "react";
// import styles from "./CreditPlanCard.module.css";
// import { LemonSqueezy } from "@lemonsqueezy/lemonsqueezy.js";
// import { useRouter } from "next/router";
// import { useSession, signOut } from "next-auth/react";
// import { CircularProgress, useMediaQuery, useTheme } from "@mui/material";
// import { inrPrice, usPrice } from '../../constant/Constant'
// function CreditPlanCard() {
//     const [product, setProduct] = useState(null);
//     const router = useRouter();
//     const { data: session } = useSession();
//     const [countryLocation, setCountryLocation] = useState("");
//     const [priceDetails, setPriceDetails] = useState()
//     const [conversionRate, setConversionrate] = useState()

//     const theme = useTheme();
//     const matches = useMediaQuery(theme.breakpoints.up("md"));

//     const fetchUserLocation = async () => {
//         await fetch("https://ipapi.co/json/")
//             .then((response) => response.json())
//             .then((data) => {
//                 const country = data.country;
//                 // Check if country is US and render price accordingly
//                 setCountryLocation(country);
//                 if (country === 'IN') {
//                     setPriceDetails(inrPrice)
//                 } else {
//                     setPriceDetails(usPrice)
//                 }
//             })
//             .catch((error) => console.error("Error fetching IP geolocation:", error));
//         // Setting URL
//         const url_str = "https://v6.exchangerate-api.com/v6/ef1fc8abb23f6d2e3dabbbc2/latest/USD";

//         // Making Request
//         fetch(url_str)
//             .then(response => {
//                 // Check if the response is successful
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                     console.log("ljnjknnjkn err")
//                 }
//                 // Parse JSON response
//                 return response.json();
//             })
//             .then(data => {
//                 // Accessing object
//                 const req_result = data;
//                 // Use req_result here
//                 setConversionrate(req_result.conversion_rates.INR)
//                 // console.log("req_result", req_result.conversion_rates.INR);
//             })
//             .catch(error => {
//                 console.error('There was a problem with the fetch operation:', error);
//             });

//     };

//     useEffect(() => {
//         const ls = new LemonSqueezy(process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY);

//         const fetchProductInfo = async () => {
//             try {
//                 const product = await ls.getVariants();
//                 setProduct(product);
//             } catch (error) {
//                 console.error("Error fetching product info:", error);
//             }
//         };
//         fetchUserLocation();
//         fetchProductInfo();
//     }, []);

//     const successPaymentHandler = async (variantId) => {
//         const ls = new LemonSqueezy(process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY);

//         try {
//             if (!session) {
//                 router.push("/login");
//             }

//             if (session) {
//                 const res = await fetch("/api/checkouts", {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json", // Specify content type as JSON
//                     },
//                     body: JSON.stringify({
//                         variantId: variantId,
//                     }),
//                 });

//                 const result = await res.json();

//                 if (result.error) {
//                     alert(result.message);
//                 } else {
//                     // ls.Url.Open(checkout.url)
//                     // LemonSqueezy.Url.Open(result.url)
//                     router.push(result.url);
//                 }
//             }
//         } catch (error) {
//             console.error("Error creating checkout:", error);
//             // Handle error if necessary
//         }
//     };
//     console.log("conversionRate", conversionRate)
//     console.log("countryLocation", countryLocation)
//     return (
//         <div className={styles.creditCardPlan}>
//             <div className={styles.cardTitle} style={{ paddingTop: "6em" }}>
//                 <span>Credit Plans</span>
//                 <p style={{ marginTop: "3em", padding: "0.3rem 1.5rem" }}>
//                     Welcome to our pricing section, where simplicity meets value. We
//                     believe in offering straightforward pricing options that cater to your
//                     specific needs.{matches && <br />} Whether you're an individual
//                     looking to enhance your photos
//                 </p>
//             </div>
//             <div
//                 className={styles.cardContainer}
//                 style={{
//                     flexDirection: !matches && "column",
//                     padding: !matches && "0.3rem 1rem",
//                 }}
//             >
//                 {product && product?.data?.length > 0 ? (
//                     product?.data?.map((item, index) => {
//                         if (item.attributes.name === "Default") return null;

//                         return (
//                             <div
//                                 key={index}
//                                 className={styles.card}
//                                 style={{
//                                     border:
//                                         item.attributes.name === "Popular" && "1px solid teal",
//                                 }}
//                                 onClick={() => successPaymentHandler(item.id)}
//                             >
//                                 {item.attributes.name === "Standard" && <h1>150 Credits</h1>}
//                                 {item.attributes.name === "Popular" && <h1>400 Credits</h1>}
//                                 {item.attributes.name === "Premium" && <h1>850 Credits</h1>}
//                                 {/* <h4> &nbsp;  (75 Credits Extra)</h4> */}
//                                 {/* <h4>({item.attributes.name})</h4> */}
//                                 <br />
//                                 {/* {item.attributes.name === 'Standard' && <div className={styles.ribbon}>Standard</div>} */}
//                                 {item.attributes.name === "Popular" && (
//                                     <div className={styles.ribbon}>
//                                         <div style={{ display: "flex", flexDirection: "column" }}>
//                                             {" "}
//                                             <span>⭐⭐</span>
//                                             <span>Popular</span>{" "}
//                                         </div>
//                                     </div>
//                                 )}
//                                 {item.attributes.name === "Premium" && (
//                                     <div className={styles.ribbon}>
//                                         <div style={{ display: "flex", flexDirection: "column" }}>
//                                             {" "}
//                                             <span>⭐⭐⭐</span>
//                                             <span>Premium</span>{" "}
//                                         </div>
//                                     </div>
//                                 )}
//                                 {/* {item.attributes.name === 'Premium' && <div className={styles.ribbon}> Premium</div>} */}
//                                 <br />
//                                 <hr />
//                                 <br />
//                                 <ul>
//                                     {item.attributes.name === "Standard" && (
//                                         <li>150 Photo Credits</li>
//                                     )}
//                                     {item.attributes.name === "Popular" && (
//                                         <li>375 Photo Credits</li>
//                                     )}
//                                     {item.attributes.name === "Premium" && (
//                                         <li>750 Photo Credits</li>
//                                     )}
//                                     {item.attributes.name === "Popular" && (
//                                         <li>+25 Credits Extra</li>
//                                     )}
//                                     {item.attributes.name === "Premium" && (
//                                         <li>+100 Credits Extra</li>
//                                     )}
//                                     <li> Free Remove Background </li>
//                                     <li>1 Credit used per model</li>
//                                     <li>Access of all Models</li>
//                                     <li>Credits will expire in 1 year</li>
//                                     {item.attributes.name === "Standard" && (
//                                         <>
//                                             <br />
//                                             <br />
//                                         </>
//                                     )}
//                                     {/* <li>
//                                     Can be used to activate Analytics plan
//                                     </li>
//                                 <li>
//                                     Can be used for all Models
//                                 </li> */}
//                                 </ul>
//                                 <hr />

//                                 <span className={styles.price}>
//                                     {/* {countryLocation === 'IN' ? <h1>₹{(item.attributes.price / 100) * conversionRate}</h1> : <h1>${item.attributes.price / 100}</h1>} */}
//                                     <h1>₹{item.attributes.price / 100}</h1>
//                                     {/* <p>(Incl. 18% GST)</p> */}
//                                 </span>
//                             </div>
//                         );
//                     })
//                 ) : (
//                     <div
//                         style={{
//                             width: "100%",
//                             height: "100%",
//                             display: "flex",
//                             justifyContent: "center",
//                             alignItems: "center",
//                         }}
//                     >
//                         <CircularProgress />
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default CreditPlanCard;

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
