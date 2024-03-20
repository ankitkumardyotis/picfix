import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import React, { use, useContext, useEffect, useState } from "react";
import AppContext from "@/components/AppContext";
import Head from "next/head";
import ImageComponent from "@/components/imageComponent";
import CircularWithValueLabel from "@/components/CircularProgressWithLabel";
import { file } from "jszip";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { createHistory, updatePlan } from "@/lib/userData";


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
    const fetchUserPlan = async () => {
        try {
            const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch plan data');
            }
            const data = await response.json();
            // console.log("data", data.plan)
            // return data.plan;
            setUserPlan(data.plan)
            setUserPlanStatus(true)
        } catch (error) {
            console.error('Error fetching plan data:', error);
        }
    };

    useEffect(() => {
        if (status === "loading") {
            setLoadindSession(true);
        } else if (!session) {
            router.push("/login");
        } else {
            setLoadindSession(false);
            fetchUserPlan();
        }
    }, [session, status, router]);


    // async function generatePhoto(fileUrl) {
    //     await new Promise((resolve) => setTimeout(resolve, 500));
    //     setLoading(true);
    //     const res = await fetch("/api/generateRestoreImage", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ imageUrl: fileUrl }),
    //     });
    //     let result = await res.json();
    //     console.log("newPhoto=>>>>>>>>>>>>", result)
    //     if (res.status !== 200) {
    //         setError(result);
    //         setLoadCircularProgress(true)
    //     } else {

    //         setRestoredPhoto(result.output);

    //         if (userPlan) {

    //             const response = await fetch(`/api/dataFetchingDB/updateData?userId=${session?.user.id}`);
    //             if (!response.ok) {
    //                 throw new Error('Failed to fetch plan data');
    //             }
    //             // const data = await response.json();
    //             // console.log("data after saveingś ===>", data.plan)

    //             // const data = {
    //             //     userId: session.user.id,
    //             //     model: result.model,
    //             //     status: result.status,
    //             //     createdAt: result.created_at,
    //             //     replicateId: result.id
    //             // }
    //             const history = await fetch('/api/dataFetchingDB/updateHistory', {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify({
    //                     userId: session.user.id,
    //                     model: result.model,
    //                     status: result.status,
    //                     createdAt: result.created_at,
    //                     replicateId: result.id
    //                 }),

    //             });
    //             // console.log("history", history)
    //             if (!history.ok) {
    //                 throw new Error('Failed to fetch plan data');
    //             }
    //             // const saveHistory=await createHistory(data);
    //             // console.log("rersponse from replicate ", data)
    //         }



    //         setError(null)
    //         setLoadCircularProgress(false)
    //     }
    //     setLoading(false);
    // }
    async function generatePhoto(fileUrl) {
        setLoading(true);
        try {
            const res = await fetch("/api/generateRestoreImage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageUrl: fileUrl }),
            });
            if (!res.ok) {
                throw new Error('Failed to generate photo');
            }
            const result = await res.json();
            setRestoredPhoto(result.output);
    
            if (userPlan) {
                const updateResponse = await fetch(`/api/dataFetchingDB/updateData?userId=${session?.user.id}`);
                if (!updateResponse.ok) {
                    throw new Error('Failed to update user plan');
                }
                console.log("updateResponse", updateResponse)
    
                const historyResponse = await fetch('/api/dataFetchingDB/updateHistory', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: session.user.id,
                        model: result.model,
                        status: result.status,
                        createdAt: result.created_at,
                        replicateId: result.id
                    }),
                });
    
                console.log("historyResponse", historyResponse)
                if (!historyResponse.ok) {
                    throw new Error('Failed to create history entry');
                }
            }
            setError(null);
        } catch (error) {
            console.error('Error generating photo==>', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        if (fileUrl) {
            generatePhoto(fileUrl);
            console.log("first")
            setTimeout(() => {
                if (!restoredPhoto) {
                    setError("true");
                    setLoadCircularProgress(true)
                    console.log("not success")
                } else {
                    // alert("success")
                }

            }, "100000")
        }
    }, [fileUrl]);

    if (userPlan?.remainingPoints === 0 || userPlan?.remainingPoints < 0 || userPlan === null) {
        return <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1em', flexDirection: 'column' }}>
            <h4>Uh Oh ! It look like You Don't Have much credit points to run this model</h4>
            <Button variant="contain" sx={{ border: '1px solid teal' }} onClick={() => { router.push('/price') }}>Buy Credits</Button>
        </Box>
    }


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
            {userPlanStatus ? <><div style={{ paddingBottom: '1px' }} id="ClickToUp"> </div>
                <main className="aiModels" style={{ display: "flex", justifyContent: "center" }} >
                    <Container maxWidth="xl">
                        <Typography variant="h2" sx={{ paddingTop: "30px", fontSize: "3rem", fontWeight: "700", marginBottom: "5px", color: " #000", lineHeight: "50px", textAlign: "center", }}>
                            Restore Photo
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "500", marginBottom: "5px", color: " #0e0e0e", textAlign: "center", }}>
                            Enhance your images like a pro!
                        </Typography>
                        <ImageComponent setError={setError} setLoadCircularProgress={setLoadCircularProgress} loadCircularProgress={loadCircularProgress} setFileUrl={setFileUrl} cropUploadedImage={cropUploadedImage} fileUrl={fileUrl} restoredPhoto={restoredPhoto} setRestoredPhoto={setRestoredPhoto} loading={loading} setLoading={setLoading} error={error} />

                    </Container>
                </main></> : <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1em', flexDirection: 'column' }}>
                <CircularProgress />
            </Box>}
        </>
    );
}

export default RestorePhoto;
