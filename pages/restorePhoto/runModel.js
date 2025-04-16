import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import React, { use, useContext, useEffect, useRef, useState } from "react";
import AppContext from "@/components/AppContext";
import Head from "next/head";
import ImageComponent from "@/components/imageComponent";
import CircularWithValueLabel from "@/components/CircularProgressWithLabel";
import { file } from "jszip";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { createHistory, updatePlan } from "@/lib/userData";
import Uploader from "@/components/uploadContainerbase64/Uploader";

function RestorePhoto() {
    const context = useContext(AppContext);
    const [restoredPhoto, setRestoredPhoto] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileUrl = context.fileUrl;
    const setFileUrl = context.setFileUrl;
    const [cropUploadedImage, setcropUploadedImage] = useState(false);
    const [loadCircularProgress, setLoadCircularProgress] = useState(false);
    const { data: session, status } = useSession();
    const [userPlan, setUserPlan] = useState('');
    const [userPlanStatus, setUserPlanStatus] = useState(false);

    const router = useRouter();
    const [loadindSession, setLoadindSession] = useState(false);
    // const fetchUserPlan = async () => {
    //     try {
    //         const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch plan data');
    //         }
    //         const data = await response.json();
    //         setUserPlan(data.plan)
    //         setUserPlanStatus(true)
    //     } catch (error) {
    //         console.error('Error fetching plan data:', error);
    //     }
    // };

    useEffect(() => {
        if (status === "loading") {
        } else if (!session) router.push("/login");
        // else fetchUserPlan();
    }, [session, status, router]);


    const { timerForRunModel } = useContext(AppContext);
    const timerForRunModelRef = useRef(timerForRunModel);
    useEffect(() => {
        timerForRunModelRef.current = timerForRunModel;
    }, [timerForRunModel]);

    const generatePhoto = async (fileUrl) => {
        setLoading(true);
        try {
            const res = await fetch("/api/replicatePredictionWebhook/getPrediction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageUrl: fileUrl, apiName: 'restorePhoto' }),
            });
            if (!res.ok) {
                throw new Error('Failed to generate photo');
            }
            const result = await res.json();
            const replicateImageId = result.id;
            let webhookDBResponse;

            while (!webhookDBResponse) {


                const response = await fetch(`/api/replicatePredictionWebhook/getImageFromDB?replicateId=${replicateImageId}`);
                if (response.status === 200) {
                    const data = await response.json();
                    console.log("response", data)
                    webhookDBResponse = data;
                    if (data.webhookData.output[0]) {
                        // // Update user plan and history as needed here
                        // if (userPlan) {

                        //     // const response = await fetch(`/api/dataFetchingDB/updateData?userId=${session?.user.id}`);
                        //     // const newCreditpoints = await response.json();
                        //     // context.setCreditPoints(newCreditpoints.saveCreditPoint.remainingPoints)

                        //     if (!response.ok) {
                        //         throw new Error('Failed to fetch plan data');
                        //     }
                        const history = await fetch('/api/dataFetchingDB/updateHistory', {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                userId: session.user.id,
                                model: data.webhookData.model,
                                status: data.webhookData.status,
                                createdAt: data.webhookData.created_at,
                                replicateId: data.webhookData.id
                            }),

                        });
                        //     if (!history.ok) {
                        //         throw new Error('Failed to fetch plan data');
                        //     }
                        // }
                        setRestoredPhoto(data.webhookData.output[0]);
                    }
                } else {
                    if (timerForRunModelRef.current > 98) {
                        await fetch(`/api/replicatePredictionWebhook/cancelPrediction?replicateId=${replicateImageId}`);
                        setError("true");
                        setLoadCircularProgress(true);
                        break;
                    }
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }
            setError(null);
        } catch (error) {
            console.error('Error generating photo==>', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (fileUrl) generatePhoto(fileUrl);
    }, [fileUrl]);


    // if (userPlan?.remainingPoints === 0 || userPlan?.remainingPoints < 0 || userPlan === null) {
    //     return router.push('/price')
    // }

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        // if (file) {
        //     // Check if the file is HEIF/HEIC
        //     if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        //         try {
        //             // Dynamically import heic2any only on the client side
        //             const heic2any = (await import('heic2any')).default;
                    
        //             // Convert HEIF/HEIC to JPG
        //             const convertedBlob = await heic2any({
        //                 blob: file,
        //                 toType: "image/jpeg",
        //                 quality: 0.8
        //             });
                    
        //             const reader = new FileReader();
        //             reader.onload = (e) => {
        //                 setFileUrl(e.target.result);
        //             };
        //             reader.readAsDataURL(convertedBlob);
        //         } catch (error) {
        //             console.error('Error converting HEIF/HEIC image:', error);
        //             setError('Failed to convert HEIF/HEIC image');
        //         }
        //     } else {
        //         // Handle regular images
        //         const reader = new FileReader();
        //         reader.onload = (e) => {
        //             setFileUrl(e.target.result);
        //         };
        //         reader.readAsDataURL(file);
        //     }
        // }
    };

    return (
        <>
            <Head>
                <title>Restore Photo | Restore Quality of Photos | PicFix.AI </title>
                <meta name="description" content=" PicFix offers professional photo restoration services to revive and enhance the quality of your cherished photographs. Restore faded colors, remove blemishes, and bring life back to your old photos. Get started today!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {/* <link rel="icon" href="/assets/logo.png" /> */}
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
            {/* {userPlanStatus ? <> */}
            <div style={{ paddingBottom: '1px' }} id="ClickToUp"> </div>
            <main className="aiModels" style={{ display: "flex", justifyContent: "center" }} >
                <Container maxWidth="xl" >
                    <Typography variant="h2" sx={{ paddingTop: "30px", fontSize: "3rem", fontWeight: "700", marginBottom: "5px", color: " #000", lineHeight: "50px", textAlign: "center", }}>
                        Restore Photo
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "500", marginBottom: "5px", color: " #0e0e0e", textAlign: "center", }}>
                        Enhance your images like a pro!
                    </Typography>

                    {!fileUrl && <Box display='flex' justifyContent='center'>
                        <Uploader handleImageUpload={handleImageUpload} />
                    </Box>}
                    <ImageComponent setError={setError} setLoadCircularProgress={setLoadCircularProgress} loadCircularProgress={loadCircularProgress} setFileUrl={setFileUrl} cropUploadedImage={cropUploadedImage} fileUrl={fileUrl} restoredPhoto={restoredPhoto} setRestoredPhoto={setRestoredPhoto} loading={loading} setLoading={setLoading} error={error} />

                </Container>
            </main></>
        // : <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1em', flexDirection: 'column' }}>
        //     <CircularProgress />
        // </Box> } </>
    );
}

export default RestorePhoto;