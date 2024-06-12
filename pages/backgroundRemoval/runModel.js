import ToggleButtonContainer from '@/components/toggleButtonContainer';
import { Box, CircularProgress, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useSession } from 'next-auth/react';
import Head from 'next/head'
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react'
import ReactCompareImage from 'react-compare-image';
import ReactConfetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize'

export default function RemoveBackground() {
    const [status, setStatus] = useState('');
    const confetiRef = useRef(null);
    const [uploadedImage, setUploadedImage] = useState('')
    const theme = useTheme();
    const [bgRemovedImage, setbgRemovedImage] = useState("");
    const [toggleClick, setToggleClick] = useState(false);
    const [originalImageHeight, setOriginalImageHieght] = useState(0);
    const { width, height } = useWindowSize();
    const matches = useMediaQuery(theme.breakpoints.down('md').replace(/^@media( ?)/m, '')) ?? false
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (matches) {
            setToggleClick(true);
        }
    }, [matches]);




    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/index-E_M5nW8h.js'; // Update the path to the script
        script.type = 'module';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);


        const handleStatusChange = async () => {

            let statusOfModel;
            while (!statusOfModel) {
                const statusElement = document.getElementById('status');
                console.log("sttatus ekemnt", statusElement)
                if (statusElement) {
                    setStatus(statusElement.textContent);
                    statusOfModel = statusElement.textContent
                    break;
                }
                await new Promise((resolve) => setTimeout(() => {
                    resolve()
                }, 1000));
            }


        };

        document.onload = handleStatusChange;
        return () => {
            document.head.removeChild(script);
        };

    }, []);

    const handleUploadNewImages = () => {
        window.location.reload();
    }

    useEffect(() => {
        const statusLabel = document.getElementById('status');
        const container = document.getElementById('removedBackgroundImage');

        if (statusLabel && container) {
            const initialStatus = statusLabel.textContent;
            setStatus(initialStatus);

            // Observer for status label changes
            const statusObserver = new MutationObserver(() => {
                setStatus(statusLabel.textContent);
            });
            statusObserver.observe(statusLabel, { childList: true });

            // Observer for image source changes
            const imageObserver = new MutationObserver(() => {
                const imgElement = container.querySelector('img');
                if (imgElement) {
                    const imageURL = imgElement.src;
                    setbgRemovedImage(imageURL)
                    // Now you have the URL of the image, you can do whatever you want with it
                }
            });
            imageObserver.observe(container, { childList: true, subtree: true });

            // Cleanup function to disconnect the observers when the component unmounts
            return () => {
                statusObserver.disconnect();
                imageObserver.disconnect();
            };
        }
    }, []);

    async function saveHistory() {
        const currentTime = new Date();
        const createdAt = currentTime.toISOString();
        const history = await fetch('/api/dataFetchingDB/updateHistory', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: session.user.id,
                model: 'Remove Background',
                status: 'succeeded',
                createdAt: createdAt,
                replicateId: ''
            }),

        });
        // console.log("history", history)
        if (!history.ok) {
            throw new Error('Failed to fetch plan data');
        }
    }

    useEffect(() => {
        if (status == 'Done!') {
            saveHistory();
        }
    }, [status])

    return (
        <div>
            <Head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Transformers.js - Background Removal</title>
            </Head>

            {/* Body content */}
            <div className='aiModels' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '1.4rem', padding: '2rem' }}>
                <main style={{ display: 'flex', justifyContent: 'center' }}>
                    <Container maxWidth='xl'  >
                        <Typography variant="h2" sx={{ paddingTop: '30px', fontSize: '3rem', fontWeight: '700', marginBottom: '5px', color: ' #000', lineHeight: '50px', textAlign: 'center' }} >
                            Remove Background
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: '500', marginBottom: '25px', color: ' #0e0e0e', textAlign: 'center' }}  >
                            Effortlessly Remove Backgrounds!
                        </Typography>
                    </Container >
                </main >
                <div id="container" className='uploader-custom-border' style={{ width: !matches && '30%', height: '20rem', display: uploadedImage ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <label id="upload-button" htmlFor="upload">
                        <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#000"
                                d="M3.5 24.3a3 3 0 0 1-1.9-.8c-.5-.5-.8-1.2-.8-1.9V2.9c0-.7.3-1.3.8-1.9.6-.5 1.2-.7 2-.7h18.6c.7 0 1.3.2 1.9.7.5.6.7 1.2.7 2v18.6c0 .7-.2 1.4-.7 1.9a3 3 0 0 1-2 .8H3.6Zm0-2.7h18.7V2.9H3.5v18.7Zm2.7-2.7h13.3c.3 0 .5 0 .6-.3v-.7l-3.7-5a.6.6 0 0 0-.6-.2c-.2 0-.4 0-.5.3l-3.5 4.6-2.4-3.3a.6.6 0 0 0-.6-.3c-.2 0-.4.1-.5.3l-2.7 3.6c-.1.2-.2.4 0 .7.1.2.3.3.6.3Z">
                            </path>
                        </svg>
                        Click to upload image
                        {/* <label id="example">(or try example)</label> */}
                    </label>
                </div>
                <label id="status" style={{ display: status != 'Loading model...' && 'none' }}></label>
                <input id="upload" type="file" accept="image/*" onChange={(e) => {
                    setUploadedImage(URL.createObjectURL(e.target.files[0]))
                    setOriginalImageHieght(e.target.files[0].offsetHeight)
                }}
                />
                {/* {status == 'Done!' && (
                    <ReactConfetti
                        // maxHeight={}
                        width={width}
                        height={height}
                        numberOfPieces={500}
                        recycle={false}
                        gravity={0.3}
                        initialVelocityY={15}
                    />
                )} */}
                {status == 'Done!' && <ToggleButtonContainer
                    setToggleClick={setToggleClick}
                    toggleClick={toggleClick}
                    matches={matches}
                />}



                {status != 'Ready' && status != 'Loading model...' && !toggleClick && <div ref={confetiRef} className='imageContainer box-container' style={{ position: "relative", overflow: 'hidden' }}>

                    {status === 'Done!' && <ReactConfetti
                        maxHeight={originalImageHeight}
                        width={width}
                        height={height}
                        numberOfPieces={500}
                        recycle={false}
                        gravity={0.3}
                        initialVelocityY={15}
                    />}


                    {!toggleClick && <> <div style={{ flex: '1' }}>
                        {uploadedImage !== '' && <div>
                            <img style={{ width: '100%', borderRadius: '5px' }} src={uploadedImage} alt='Background removal image' />
                        </div>}
                    </div>
                        <div className="bgremovedImage" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {status == "Analysing..." && <div class="custom-loader"></div>}
                            {status === "Done!" && <div> <img src={bgRemovedImage} alt="Removed Image" style={{ borderRadius: '5px', width: '100%' }} /></div>}
                        </div>
                    </>}
                </div>}
                {
                    toggleClick && <Box
                        maxWidth="sm"
                        sx={{
                            margin: "1em",
                            height: '100%',
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            boxShadow: " 0 2px 10px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        <Box sx={{ width: '100%', height: '100%' }}>
                            <ReactCompareImage leftImageLabel='before' leftImage={uploadedImage} rightImageLabel='after' rightImage={bgRemovedImage} />
                        </Box>

                    </Box>
                }
                <div id="removedBackgroundImage" style={{ display: 'none' }}></div>
                <div style={{ display: status != 'Done!' && 'none' }} className="buttons">
                    <button style={{ marginRight: '10px' }} onClick={handleUploadNewImages}>Upload New</button>
                    <button id="download-button">Download</button>
                </div>
            </div>
        </div >
    )
}






























































// import { Container, Typography } from "@mui/material";
// import React, { useContext, useEffect, useState } from "react";
// import AppContext from "@/components/AppContext";
// import Head from "next/head";
// import ImageComponent from "@/components/imageComponent";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";

// function RemoveBackground() {
//     const context = useContext(AppContext);
//     const [restoredPhoto, setRestoredPhoto] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [loadindSession, setLoadindSession] = useState(false)
//     const [error, setError] = useState(null);
//     const fileUrl = context.fileUrl;
//     const setFileUrl = context.setFileUrl;
//     const [loadCircularProgress, setLoadCircularProgress] = useState(false);

//     const router = useRouter();
//     const { data: session, status } = useSession();
//     // const [userPlan, setUserPlan] = useState('');
//     // const [userPlanStatus, setUserPlanStatus] = useState(false);


//     useEffect(() => {
//         if (status === "loading") {
//             setLoadindSession(true);
//         } else if (!session) {
//             router.push("/login");
//         } else {
//             setLoadindSession(false);
//         }
//     }, [session, status, router]);

//     async function generatePhoto(fileUrl) {
//         setLoading(true);
//         let count = 0;
//         try {
//             const timeCount = setInterval(() => {
//                 count++
//             }, 1000);

//             const res = await fetch("/api/replicatePredictionWebhook/getPrediction", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ imageUrl: fileUrl, apiName: 'backgroundRemoval' }),
//             });
//             if (!res.ok) {
//                 throw new Error('Failed to generate photo');
//             }
//             const result = await res.json();
//             const replicateImageId = result.id;
//             let webhookDBResponse;

//             while (!webhookDBResponse) {

//                 const response = await fetch(`/api/replicatePredictionWebhook/getImageFromDB?replicateId=${replicateImageId}`)
//                 if (response.status == 200) {
//                     const data = await response.json();
//                     // console.log("response", data)

//                     webhookDBResponse = data;
//                     if (data.webhookData.output[0]) {
//                         clearInterval(timeCount);

//                         const history = await fetch('/api/dataFetchingDB/updateHistory', {
//                             method: "POST",
//                             headers: {
//                                 "Content-Type": "application/json",
//                             },
//                             body: JSON.stringify({
//                                 userId: session.user.id,
//                                 model: data.webhookData.model,
//                                 status: data.webhookData.status,
//                                 createdAt: data.webhookData.created_at,
//                                 replicateId: data.webhookData.id
//                             }),

//                         });
//                         // console.log("history", history)
//                         if (!history.ok) {
//                             throw new Error('Failed to fetch plan data');
//                         }
//                         setRestoredPhoto(data.webhookData.output[0]);
//                     }

//                 } else {
//                     if (count > 99) {
//                         clearInterval(timeCount);
//                         const cancelResponse = await fetch(`/api/replicatePredictionWebhook/cancelPrediction?replicateId=${replicateImageId}`);
//                         setError("true");
//                         setLoadCircularProgress(true)
//                         break;
//                     }
//                     await new Promise((resolve) => setTimeout(resolve, 1000));
//                 }
//             }
//             setError(null);
//         } catch (error) {
//             console.error('Error generating photo==>', error);
//             setError(error.message);
//         } finally {
//             setLoading(false);
//         }
//     }



//     useEffect(() => {
//         // async function generatePhoto(fileUrl) {
//         //     await new Promise((resolve) => setTimeout(resolve, 500));
//         //     setLoading(true);
//         //     const res = await fetch("/api/genarateRemoveImage", {
//         //         method: "POST",
//         //         headers: {
//         //             "Content-Type": "application/json",
//         //         },
//         //         body: JSON.stringify({ imageUrl: fileUrl }),
//         //     });
//         //     let newPhoto = await res.json();
//         //     if (res.status !== 200) {
//         //         setError(newPhoto);
//         //         setLoadCircularProgress(true)
//         //     } else {
//         //         setRestoredPhoto(newPhoto);
//         //         setError(null)
//         //         setLoadCircularProgress(false)
//         //     }
//         //     setLoading(false);
//         // }

//         if (fileUrl) {
//             generatePhoto(fileUrl);
//             setTimeout(() => {
//                 if (!restoredPhoto) {
//                     setError("true");
//                     setLoadCircularProgress(true)
//                 } else {
//                     // alert("success")
//                 }
//             }, 100000);
//         }
//     }, [fileUrl]);






//     if (status === "loading" || !session) {
//         return <div>Loading...</div>;
//     }

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
//     );
// }

// export default RemoveBackground;





























// // import { Container, Typography } from "@mui/material";
// // import React, { useContext, useRef, useEffect, useState } from "react";
// // import AppContext from "@/components/AppContext";
// // import Head from "next/head";
// // import ImageComponent from "@/components/imageComponent";
// // import { useSession } from "next-auth/react";
// // import { useRouter } from "next/router";


// // function RemoveBackground() {
// //     const context = useContext(AppContext);
// //     const [restoredPhoto, setRestoredPhoto] = useState("");
// //     const [loading, setLoading] = useState(false);
// //     const [error, setError] = useState(null);
// //     const fileUrl = context.fileUrl;
// //     const setFileUrl = context.setFileUrl;
// //     const [loadCircularProgress, setLoadCircularProgress] = useState(false);

// //     const { data: session } = useSession();

// //     const router = useRouter();
// //     useEffect(() => {
// //         if (!session) {
// //             router.push("/login");
// //         }
// //     }, [router])


// //     async function generatePhoto(fileUrl) {
// //         await new Promise((resolve) => setTimeout(resolve, 500));
// //         setLoading(true);
// //         const res = await fetch("/api/genarateRemoveImage", {
// //             method: "POST",
// //             headers: {
// //                 "Content-Type": "application/json",
// //             },
// //             body: JSON.stringify({ imageUrl: fileUrl }),
// //         });
// //         let newPhoto = await res.json();
// //         if (res.status !== 200) {
// //             setError(newPhoto);
// //             setLoadCircularProgress(true)
// //         } else {
// //             setRestoredPhoto(newPhoto);
// //             setError(null)
// //             setLoadCircularProgress(false)
// //         }
// //         setLoading(false);
// //     }
// //     useEffect(() => {
// //         if (fileUrl) {
// //             generatePhoto(fileUrl);
// //             setTimeout(() => {
// //                 if (!restoredPhoto) {
// //                     setError("true");
// //                     setLoadCircularProgress(true)
// //                     console.log("not success")
// //                 } else {
// //                     // alert("success")
// //                 }

// //             },  "100000")
// //         }
// //     }, [fileUrl]);



// //     return (
// //         <>
// //             <Head>
// //                 <title> Remove Image Backgrounds | PicFix.AI | Fast and Easy Background Removal in one click</title>
// //                 <meta name="description" content="PicFix is your go-to solution for removing backgrounds from images. Our advanced AI technology ensures fast and easy background removal, allowing you to create professional-looking images effortlessly. Try PicFix.AI today and enhance your visuals instantly." />
// //                 <meta name="viewport" content="width=device-width, initial-scale=1" />
// //                 <link rel="icon" href="/assets/logo.jpg" />
// //                 <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}></script>
// //                 <script
// //                     dangerouslySetInnerHTML={{
// //                         __html: `

// //                             window.dataLayer = window.dataLayer || [];
// //                             function gtag(){dataLayer.push(arguments);}
// //                             gtag('js', new Date());
// //                             gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}',{
// //                             page_path: window.location.pathname,

// //                             });
// //                         `,
// //                     }}
// //                 />
// //             </Head>
// //             <div style={{ paddingBottom: '1px' }} id="ClickToUp"> </div>
// //             <main className='aiModels' style={{ display: 'flex', justifyContent: 'center' }}>
// //                 <Container maxWidth='xl'  >
// //                     <Typography variant="h2" sx={{ paddingTop: '30px', fontSize: '3rem', fontWeight: '700', marginBottom: '5px', color: ' #000', lineHeight: '50px', textAlign: 'center' }} >
// //                         Remove Background
// //                     </Typography>
// //                     <Typography variant="h6" sx={{ fontWeight: '500', marginBottom: '25px', color: ' #0e0e0e', textAlign: 'center' }}  >
// //                         Effortlessly Remove Backgrounds!
// //                     </Typography>
// //                     <ImageComponent setError={setError} error={error} setLoadCircularProgress={setLoadCircularProgress} loadCircularProgress={loadCircularProgress} setFileUrl={setFileUrl} fileUrl={fileUrl} restoredPhoto={restoredPhoto} setRestoredPhoto={setRestoredPhoto} loading={loading} setLoading={setLoading} />
// //                 </Container >
// //             </main >
// //         </>
// //     )
// // }

// // export default RemoveBackground



