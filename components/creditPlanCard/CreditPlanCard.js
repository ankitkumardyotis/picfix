import React, { useEffect, useState } from "react";
import styles from "./CreditPlanCard.module.css";
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
  // const [conversionRate, setConversionrate] = useState();

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
          const inrPrice = priceStructure.filter(
            (item) => item.country === "IN"
          );
          setPriceDetails(inrPrice);
        } else {
          const usPrice = priceStructure.filter(
            (item) => item.country === "Others Country"
          );
          setPriceDetails(usPrice);
        }
      })
      .catch((error) => console.error("Error fetching IP geolocation:", error));
    // Setting URL
    const url_str =
      "https://v6.exchangerate-api.com/v6/ef1fc8abb23f6d2e3dabbbc2/latest/USD";
  };

  useEffect(() => {
    fetchUserLocation();
    const Price = priceStructure.filter((item) => item.country === countryLocation);
    setPriceDetails(Price);
  }, []);

  const successPaymentHandler = async (price) => {
    try {
      if (!session) {
        router.push("/login");
      }

      if (session) {
        const response = await fetch("/api/razorpayPayment/createCheckout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: price, currency: countryLocation }),
        });
        const { order } = await response.json();

        const options = {
          key: process.env.RAZORPAY_TEST_KEY_ID,
          amount: order.amount,
          name: 'PicFix.ai',
          currency: order.currency,
          image: 'https://www.picfix.ai/favicon.ico',
          order_id: order.id,
          callback_url: "api/razorpayPayment/verifyPayment",
          prefill: {
            name: session.user.name,
            email: session.user.email,
          },
          theme: {
            "color": "#b2b2ff"
          }
        };
        const razor = new window.Razorpay(options);
        razor.open();
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
          Whether you're an individual looking to enhance your photos, or a
          business seeking comprehensive image solutions,
          {matches && <br />}{" "}our pricing options
          are designed to accommodate your specific needs.


        </p>
      </div>
      <div
        className={styles.cardContainer}
        style={{
          flexDirection: !matches && "column",
          padding: !matches && "0.3rem 1rem",
        }}
      >
        {priceDetails.map((item, idx) => {
          return (
            <div
              key={idx}
              className={styles.card}
              style={{
                border: "1px solid teal",
              }}
            >
              <h1>{item.creditPoints} Credits</h1>
              <br />

              {item.name === "standard" && (
                <div className={styles.ribbon}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {" "}
                    <span>⭐</span>
                    <span>Basic</span>{" "}
                  </div>
                </div>
              )}

              {item.name === "premium" && (
                <div className={styles.ribbon}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {" "}
                    <span>⭐⭐⭐</span>
                    <span>Premium</span>{" "}
                  </div>
                </div>
              )}
              {item.name === "popular" && (
                <div className={styles.ribbon}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {" "}
                    <span>⭐⭐</span>
                    <span>Popular</span>{" "}
                  </div>
                </div>
              )}
              {/* {item.attributes.name === 'Premium' && <div className={styles.ribbon}> Premium</div>} */}

              <br />

              <hr />
              <br />
              <ul>
                <li>
                  {item.creditPoints - item.extraCreditPoints} Photo Credits
                </li>
                {item.extraCreditPoints != 0 && (
                  <li>+{item.extraCreditPoints} Credits Extra</li>
                )}
                {item.extraCreditPoints == 0 && (
                  <>
                    <li>No Extra Credits</li>
                  </>
                )}
                <li> Free Remove Background </li>
                <li>1 Credit used per model</li>
                <li>Access of all Models</li>
                <li>Credits will expire in 1 year</li>
    
              </ul>
              <hr />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "10px",
                }}
              >
                <span className={styles.price}>
                  {/* {countryLocation === 'IN' ? <h1>₹{(item.attributes.price / 100) * conversionRate}</h1> : <h1>${item.attributes.price / 100}</h1>} */}
                  <h1>
                    {item.country === "IN" ? "₹" : "$"}
                    {item.price}
                  </h1>
                  {/* <p>(Incl. 18% GST)</p> */}
                </span>

                <button
                  className={styles.paymentbtn}
                  onClick={() => successPaymentHandler(item.price)}
                >
                  Get Started
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CreditPlanCard;






























