import { Container, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import AppContext from "@/components/AppContext";
import Head from "next/head";
import ImageComponent from "@/components/imageComponent";
import CircularWithValueLabel from "@/components/CircularProgressWithLabel";
import { file } from "jszip";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

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

    const router = useRouter();
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


    useEffect(() => {
        // check plan

        fetchUserPlan();

    }, []);


    useEffect(() => {
        if (userPlanStatus && userPlan ===null) {
            console.log("fetchedPlan in", userPlan)
            router.push("/price");
        }
    }, [userPlan,router]);


    async function generatePhoto(fileUrl) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoading(true);
        const res = await fetch("/api/generateRestoreImage", {
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


    return (
        <>
            <Head>
                <title>Restore Photo | Restore Quality of Photos | PicFix.AI </title>
                <meta name="description" content=" PicFix offers professional photo restoration services to revive and enhance the quality of your cherished photographs. Restore faded colors, remove blemishes, and bring life back to your old photos. Get started today!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/assets/logo.png" />
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
            </main>
        </>
    );
}

export default RestorePhoto;
