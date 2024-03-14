import { Container, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import AppContext from "@/components/AppContext";
import Head from "next/head";
import ImageComponent from "@/components/imageComponent";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function RemoveBackground() {
    const context = useContext(AppContext);
    const [restoredPhoto, setRestoredPhoto] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadindSession, setLoadindSession] = useState(false)
    const [error, setError] = useState(null);
    const fileUrl = context.fileUrl;
    const setFileUrl = context.setFileUrl;
    const [loadCircularProgress, setLoadCircularProgress] = useState(false);

    const router = useRouter();
    const { data: session, status } = useSession();
    const [userPlan, setUserPlan] = useState('');
    const [userPlanStatus, setUserPlanStatus] = useState(false);
    // const fetchUserPlan = async () => {
    //   try {
    //     const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
    //     if (!response.ok) {
    //       throw new Error('Failed to fetch plan data');
    //     }
    //     const data = await response.json();
    //     // console.log("data", data.plan)
    //     // return data.plan;
    //     setUserPlan(data.plan)
    //     setUserPlanStatus(true)
    //   } catch (error) {
    //     console.error('Error fetching plan data:', error);
    //   }
    // };
  
    useEffect(() => {
      if (status === "loading") {
        setLoadindSession(true);
      } else if (!session) {
        router.push("/login");
      } else {
        setLoadindSession(false);
        // fetchUserPlan();
      }
    }, [session, status, router]);
  
  
  
  
    // useEffect(() => {
    //   if (userPlanStatus && userPlan === null) {
    //     console.log("fetchedPlan in", userPlan)
    //     router.push("/price");
    //   }
    // }, [userPlan, router]);

    useEffect(() => {
        async function generatePhoto(fileUrl) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setLoading(true);
            const res = await fetch("/api/genarateRemoveImage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageUrl: fileUrl }),
            });
            let newPhoto = await res.json();
            if (res.status !== 200) {
                setError(newPhoto);
                setLoadCircularProgress(true)
            } else {
                setRestoredPhoto(newPhoto);
                setError(null)
                setLoadCircularProgress(false)
            }
            setLoading(false);
        }

        if (fileUrl) {
            generatePhoto(fileUrl);
            setTimeout(() => {
                if (!restoredPhoto) {
                    setError("true");
                    setLoadCircularProgress(true)
                } else {
                    // alert("success")
                }
            }, 100000);
        }
    }, [fileUrl]);

    if (status === "loading" || !session) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Head>
                <title> Remove Image Backgrounds | PicFix.AI | Fast and Easy Background Removal in one click</title>
                <meta name="description" content="PicFix is your go-to solution for removing backgrounds from images. Our advanced AI technology ensures fast and easy background removal, allowing you to create professional-looking images effortlessly. Try PicFix.AI today and enhance your visuals instantly." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/assets/logo.jpg" />
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `

                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}',{
                            page_path: window.location.pathname,

                            });
                        `,
                    }}
                />
            </Head>
            <div style={{ paddingBottom: '1px' }} id="ClickToUp"> </div>
            <main className='aiModels' style={{ display: 'flex', justifyContent: 'center' }}>
                <Container maxWidth='xl'  >
                    <Typography variant="h2" sx={{ paddingTop: '30px', fontSize: '3rem', fontWeight: '700', marginBottom: '5px', color: ' #000', lineHeight: '50px', textAlign: 'center' }} >
                        Remove Background
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: '500', marginBottom: '25px', color: ' #0e0e0e', textAlign: 'center' }}  >
                        Effortlessly Remove Backgrounds!
                    </Typography>
                    <ImageComponent setError={setError} error={error} setLoadCircularProgress={setLoadCircularProgress} loadCircularProgress={loadCircularProgress} setFileUrl={setFileUrl} fileUrl={fileUrl} restoredPhoto={restoredPhoto} setRestoredPhoto={setRestoredPhoto} loading={loading} setLoading={setLoading} />
                </Container >
            </main >
        </>
    );
}

export default RemoveBackground;





























// import { Container, Typography } from "@mui/material";
// import React, { useContext, useRef, useEffect, useState } from "react";
// import AppContext from "@/components/AppContext";
// import Head from "next/head";
// import ImageComponent from "@/components/imageComponent";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";


// function RemoveBackground() {
//     const context = useContext(AppContext);
//     const [restoredPhoto, setRestoredPhoto] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const fileUrl = context.fileUrl;
//     const setFileUrl = context.setFileUrl;
//     const [loadCircularProgress, setLoadCircularProgress] = useState(false);

//     const { data: session } = useSession();

//     const router = useRouter();
//     useEffect(() => {
//         if (!session) {
//             router.push("/login");
//         }
//     }, [router])


//     async function generatePhoto(fileUrl) {
//         await new Promise((resolve) => setTimeout(resolve, 500));
//         setLoading(true);
//         const res = await fetch("/api/genarateRemoveImage", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ imageUrl: fileUrl }),
//         });
//         let newPhoto = await res.json();
//         if (res.status !== 200) {
//             setError(newPhoto);
//             setLoadCircularProgress(true)
//         } else {
//             setRestoredPhoto(newPhoto);
//             setError(null)
//             setLoadCircularProgress(false)
//         }
//         setLoading(false);
//     }
//     useEffect(() => {
//         if (fileUrl) {
//             generatePhoto(fileUrl);
//             setTimeout(() => {
//                 if (!restoredPhoto) {
//                     setError("true");
//                     setLoadCircularProgress(true)
//                     console.log("not success")
//                 } else {
//                     // alert("success")
//                 }

//             },  "100000")
//         }
//     }, [fileUrl]);



//     return (
//         <>
//             <Head>
//                 <title> Remove Image Backgrounds | PicFix.AI | Fast and Easy Background Removal in one click</title>
//                 <meta name="description" content="PicFix is your go-to solution for removing backgrounds from images. Our advanced AI technology ensures fast and easy background removal, allowing you to create professional-looking images effortlessly. Try PicFix.AI today and enhance your visuals instantly." />
//                 <meta name="viewport" content="width=device-width, initial-scale=1" />
//                 <link rel="icon" href="/assets/logo.jpg" />
//                 <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}></script>
//                 <script
//                     dangerouslySetInnerHTML={{
//                         __html: `

//                             window.dataLayer = window.dataLayer || [];
//                             function gtag(){dataLayer.push(arguments);}
//                             gtag('js', new Date());
//                             gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}',{
//                             page_path: window.location.pathname,

//                             });
//                         `,
//                     }}
//                 />
//             </Head>
//             <div style={{ paddingBottom: '1px' }} id="ClickToUp"> </div>
//             <main className='aiModels' style={{ display: 'flex', justifyContent: 'center' }}>
//                 <Container maxWidth='xl'  >
//                     <Typography variant="h2" sx={{ paddingTop: '30px', fontSize: '3rem', fontWeight: '700', marginBottom: '5px', color: ' #000', lineHeight: '50px', textAlign: 'center' }} >
//                         Remove Background
//                     </Typography>
//                     <Typography variant="h6" sx={{ fontWeight: '500', marginBottom: '25px', color: ' #0e0e0e', textAlign: 'center' }}  >
//                         Effortlessly Remove Backgrounds!
//                     </Typography>
//                     <ImageComponent setError={setError} error={error} setLoadCircularProgress={setLoadCircularProgress} loadCircularProgress={loadCircularProgress} setFileUrl={setFileUrl} fileUrl={fileUrl} restoredPhoto={restoredPhoto} setRestoredPhoto={setRestoredPhoto} loading={loading} setLoading={setLoading} />
//                 </Container >
//             </main >
//         </>
//     )
// }

// export default RemoveBackground



