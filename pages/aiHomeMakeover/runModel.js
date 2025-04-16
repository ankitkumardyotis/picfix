import { Box, Button, CircularProgress, Container, Input, TextField, Typography } from "@mui/material";
import ToggleButtonContainer from "@/components/toggleButtonContainer";
import OriginalImage from "@/components/originalImageForTrendyLook";
import React, { useContext, useRef, useEffect, useState, useMemo } from "react";
import AppContext from "@/components/AppContext";
import { ReactCompareSlider, ReactCompareSliderImage, } from "react-compare-slider";
import Image from "next/image";
import axios from "axios";
import Confetti from "react-confetti";
import { useMediaQuery } from '@mui/material';
import Head from "next/head";
import ReactCompareImage from "react-compare-image";
import { useWindowSize } from "react-use";
import { useRouter } from 'next/router';
import CircularWithValueLabel from "@/components/CircularProgressWithLabel";
import { useSession } from "next-auth/react";
import Uploader from "@/components/uploadContainerbase64/Uploader";
import { useTheme } from '@mui/material/styles';



function DesignRoom() {
    // const context = useContext(AppContext);
    const router = useRouter();

    const [restoredPhoto, setRestoredPhoto] = useState("");
    const [clickToSubmitButton, setClickToSubmitButton] = useState(false);
    const [toggleClick, setToggleClick] = useState(false);
    const [loading, setLoading] = useState(false);
    const [originalImageHeight, setOriginalImageHieght] = useState(0);
    const [originalImageWidth, setOriginalImageWidth] = useState(0);
    const [error, setError] = useState(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [restoreImageCompleteLoaded, setRestoreImageCompleteLoaded] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [focusOnInputField, setFocusOnInputField] = useState(false);
    const [requireValuePrompt, setRequireValuePrompt] = useState(false);
    const [ClicktoGo, setClicktoGo] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [highlight, setHighlight] = useState(false);
    const [fileUrl, setFileUrl] = useState('');
    const [cropImage, setCropImage] = useState(false);
    const [loadCircularProgress, setLoadCircularProgress] = useState(false);
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const { width, height } = useWindowSize();
    // const [height, setHeight] = useState(null);
    // const [width, setWidth] = useState(null);
    const confetiRef = useRef(null);
    const [loadindSession, setLoadindSession] = useState(false);
    const { data: session, status } = useSession();
    const [userPlan, setUserPlan] = useState('');

    const [userPlanStatus, setUserPlanStatus] = useState(false);

    const { timerForRunModel, setCreditPoints } = useContext(AppContext);
    const timerForRunModelRef = useRef(timerForRunModel);
    useEffect(() => {
        timerForRunModelRef.current = timerForRunModel;
    }, [timerForRunModel]);



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
            setLoadindSession(true);
        } else if (!session) {
            router.push("/login");
        } else {
            setLoadindSession(false);
            // fetchUserPlan();
        }
    }, [session, status, router]);






    async function generatePhoto(fileUrl) {
        setLoading(true);

        try {


            const res = await fetch("/api/replicatePredictionWebhook/getPrediction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageUrl: fileUrl, prompt: prompt, apiName: "aiHomeMakeOver" }),
            });
            if (!res.ok) {
                throw new Error('Failed to generate photo');
            }
            const result = await res.json();
            const replicateImageId = result.id;
            let webhookDBResponse;

            while (!webhookDBResponse) {

                const response = await fetch(`/api/replicatePredictionWebhook/getImageFromDB?replicateId=${replicateImageId}`)
                if (response.status == 200) {
                    const data = await response.json();

                    webhookDBResponse = data;
                    if (data.webhookData.output[0][1]) {
                        // if (userPlan) {

                        //     const response = await fetch(`/api/dataFetchingDB/updateData?userId=${session?.user.id}`);

                        //     const newCreditpoints = await response.json();
                        //     setCreditPoints(newCreditpoints.saveCreditPoint.remainingPoints)

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
                        setRestoredPhoto(data.webhookData.output[0][1]);
                    }

                } else {
                    if (timerForRunModelRef.current > 98) {
                        await fetch(`/api/replicatePredictionWebhook/cancelPrediction?replicateId=${replicateImageId}`);
                        setError("true");
                        setLoadCircularProgress(true)
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
    }


    const handleDownloadFile = () => {
        axios({
            url: restoredPhoto,
            method: "GET",
            responseType: "blob",
        })
            .then((response) => {
                // Create a link element to trigger the download
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(new Blob([response.data]));
                link.setAttribute("download", "image.jpg"); // set the file name
                document.body.appendChild(link);
                link.click();
            })
            .catch((error) => {
                console.error(error);
            });
    };



    const handleInputChange = (event) => {
        setPrompt(event.target.value);
        setRequireValuePrompt(event.target.value.length == 0 ? false : true);
        setInputValue(event.target.value);
        setHighlight(false);
    };
    const handleClicktoGo = () => {
        setToggleClick(false)
        if (inputValue.trim() === '') {
            setHighlight(true);
        } else {
            if (inputValue.trim() === '') {
                setHighlight(false);
            } else {
                setHighlight(false);
            }
            setHighlight(false);
        }
        if (fileUrl && requireValuePrompt) {
            generatePhoto(fileUrl);
            setClicktoGo(true)
            setTimeout(() => {
                if (!restoredPhoto) {
                    setError("true");
                    setLoadCircularProgress(true)
                }

            }, "100000")
        } else {
            setFocusOnInputField(true);
        }
    };


    const handleToNavigatePrompt = () => {
        setClicktoGo(false);
        setRestoredPhoto('');
        setRequireValuePrompt(false);
        setLoadCircularProgress(false)
        setError(null)
    }
    const imageStyle = {
        borderRadius: '5px',
        width: '100%',
        height: '100%',
        order: 1,
    };

    // if (userPlan?.remainingPoints === 0 || userPlan?.remainingPoints < 0 || userPlan === null) {
    //     return <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1em', flexDirection: 'column' }}>
    //         <h4>Uh Oh ! It look like You Don't Have much credit points to run this model</h4>
    //         <Button variant="contain" sx={{ border: '1px solid teal' }} onClick={() => { router.push('/price') }}>Buy Credits</Button>
    //     </Box>
    // }
    if (userPlan?.remainingPoints === 0 || userPlan?.remainingPoints < 0 || userPlan === null) {
        return router.push('/price')
    }

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
                <title>AI Home Makeover | PicFix.AI </title>
                <meta name="description" content=" Embrace the future of home design with our AI-powered solution. Effortlessly reimagine your interior and exterior spaces, experiencing an instant transformation that brings beauty and style to every corner of your home." />
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
            <main
                className="aiModels"
                style={{ display: "flex", justifyContent: "center" }}>
                <Container maxWidth="xl">
                    <Typography variant="h2" sx={{ paddingTop: "30px", fontSize: matches ? "3rem" : '3rem', fontWeight: "700", marginBottom: "5px", color: " #000", lineHeight: "50px", textAlign: "center", }}>
                        AI Home Makeover
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "500", marginBottom: "5px", color: " #0e0e0e", textAlign: "center", }}>
                        Design your home with our technology
                    </Typography>
                    <div className="flex-container flex-column">
                        <div className="flex-container">
                            {fileUrl && (
                                <div style={{ visibility: !restoredPhoto ? "hidden" : "visible" }}>
                                    {!restoredPhoto || (
                                        <ToggleButtonContainer
                                            setToggleClick={setToggleClick}
                                            toggleClick={toggleClick}
                                        />
                                    )}
                                </div>
                            )}
                            {!fileUrl ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="" >
                                        <Box display='flex' justifyContent='center'>
                                            <Uploader handleImageUpload={handleImageUpload} />
                                        </Box>
                                    </div>
                                    <p style={{ textAlign: 'center', marginTop: '.5em' }}>
                                        <b><i> **Please provide a photo of the room you would like to design </i></b></p>

                                </div>
                            ) : (
                                ClicktoGo === false && (
                                    <div style={{ maxWidth: '26rem', height: '100%', display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center' }} >
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: matches ? 'row' : 'column' }}>
                                            <TextField onChange={handleInputChange} sx={{ minWidth: matches ? 340 : 300, margin: '20px 0px', borderColor: 'none', border: highlight ? '2px solid red' : '' }} id="clothingText" label="e.g. Yellow dark grey tropical" variant="outlined" placeholder="Please enter your preffered room style  " />
                                            <Button variant="contained" onClick={handleClicktoGo} sx={{ width: matches ? '' : '100%', marginLeft: matches ? '10px' : '', padding: '11px', boxShadow: 'none', backgroundColor: 'black', fontSize: '1.2em' }} >Go</Button>
                                        </Box>
                                        {/* <Box  sx={{ minWidth: matches ? 420 : 350,padding:'1em .2em'}}>
                                            <p >
                                               <i> **Please enter your preffered room style </i>
                                            </p>
                                        </Box> */}
                                        <Box sx={{ display: 'flex', width: matches ? '26em' : '20em', marginTop: matches ? '' : '20px' }} >
                                            <Image style={imageStyle} src={fileUrl} width={400} height={400} alt="Restore image" />
                                        </Box>
                                    </div>
                                )
                            )}
                        </div>

                        {toggleClick === false ? (
                            <>
                                {fileUrl && ClicktoGo && (
                                    <div
                                        className="imageContainer box-container"

                                        style={{ position: "relative", overflow: 'hidden' }}
                                    >
                                        {fileUrl && (
                                            <div id="uploadedImage" className="originalImage" style={{ position: 'relative' }}>
                                                <OriginalImage setOriginalImageHieght={setOriginalImageHieght} setOriginalImageWidth={setOriginalImageWidth} setIsImageLoaded={setIsImageLoaded} fileUrl={fileUrl} setFileUrl={setFileUrl} />
                                                {!matches && <span className="before-after-badge">Before</span>}
                                            </div>
                                        )}
                                        <div className="restoredImageContainer" style={fileUrl &&
                                            loading == false &&
                                            !restoredPhoto && matches &&
                                            originalImageHeight
                                            ? { border: "2px dotted black", borderRadius: "5px" }
                                            : null
                                        }
                                        >

                                            {loading === true && error === null ? (
                                                <div
                                                    style={matches ? {
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        height: originalImageHeight ? originalImageHeight : originalImageHeight,
                                                    } : { display: "flex", justifyContent: 'center' }}
                                                >
                                                    {" "}
                                                    {/* <CircularProgress color="inherit" /> */}
                                                    <CircularWithValueLabel />

                                                </div>
                                            ) : (!restoredPhoto && loadCircularProgress === true &&
                                                <div
                                                    style={matches ? {
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        flexDirection: 'column',
                                                        alignItems: "center",
                                                        gap: '20px',
                                                        height: `${originalImageHeight}px` ? `${originalImageHeight}px` : `${originalImageHeight}px`,
                                                    } : { display: "flex", justifyContent: 'center', alignItems: 'center' }}
                                                >
                                                    <p style={{ fontSize: '80px' }}>😭</p>
                                                    <h1>Server is busy.
                                                        <span style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                            onClick={() => {
                                                                setFileUrl(''),
                                                                    setRestoredPhoto(''),
                                                                    setLoadCircularProgress(false)
                                                                setLoading(false)
                                                                setError(null)
                                                                router.push('#ClickToUp')
                                                                window.location.reload()

                                                            }}>Please Retry
                                                        </span>
                                                    </h1>
                                                </div>
                                            )
                                            }



                                            <div className="restoredImage" style={{ position: 'relative' }}>
                                                <Image
                                                    src={restoredPhoto}
                                                    alt="Restored Image"
                                                    onLoadingComplete={(e) => {
                                                        setRestoreImageCompleteLoaded(true);
                                                    }}
                                                    style={{
                                                        borderRadius: "5px",
                                                        width: "100%",
                                                        height: "100%",
                                                        display: !restoredPhoto && "none",
                                                        order: 2,
                                                    }}
                                                    width={400}
                                                    height={200}
                                                />
                                                {restoredPhoto && !matches && <span className="before-after-badge">After</span>}
                                            </div>
                                        </div>
                                        {restoreImageCompleteLoaded && restoredPhoto && (

                                            <Confetti
                                                maxHeight={originalImageHeight}
                                                width={width}
                                                height={height}
                                                numberOfPieces={500}
                                                recycle={false}
                                                gravity={0.3}
                                                initialVelocityY={15}
                                            />


                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            restoredPhoto && (

                                <Box
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
                                    {fileUrl && (
                                        <ReactCompareImage leftImageLabel='before' leftImage={fileUrl} rightImageLabel='after' rightImage={restoredPhoto} />
                                    )}
                                </Box>
                            )
                        )}


                        {restoredPhoto && (
                            <div
                                className="upload-download-button"
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "30px",
                                    // flexWrap: "wrap"

                                }}
                            >
                                <button
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setRestoredPhoto("");
                                        setFileUrl("");
                                        if (toggleClick === true) {
                                            setToggleClick(false)
                                        }
                                        router.push('#ClickToUp');
                                        setClicktoGo(false);
                                        setRequireValuePrompt(false);
                                        setClickToSubmitButton(false);
                                        setFocusOnInputField(false);
                                        setInputValue('');
                                        setHighlight(false);
                                        setCropImage(false);
                                        setOriginalImageWidth(0);
                                        setOriginalImageHieght(0);
                                        setLoadCircularProgress(false)
                                        setError(null)
                                        window.location.reload();
                                    }}
                                >
                                    Upload New
                                </button>
                                <button
                                    style={{ cursor: "pointer" }}
                                    onClick={handleDownloadFile}
                                >
                                    Download{" "}
                                </button>
                                <button
                                    style={{ cursor: "pointer" }}
                                    onClick={handleToNavigatePrompt}>
                                    Retry{" "}

                                </button>
                            </div>
                        )}
                    </div>
                </Container>
            </main >
        </>
    );
}

export default DesignRoom;
