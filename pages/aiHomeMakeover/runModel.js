import { Box, Button, CircularProgress, Container, Input, TextField, Typography } from "@mui/material";
import ToggleButtonContainer from "@/components/toggleButtonContainer";
import UploaderComponent from "@/components/uploaderComponentForDesignRoom";
import OriginalImage from "@/components/originalImageForTrendyLook";
import React, { useContext, useRef, useEffect, useState, useMemo } from "react";
import AppContext from "@/components/AppContext";
import { ReactCompareSlider, ReactCompareSliderImage, } from "react-compare-slider";
import Image from "next/image";
import axios from "axios";
import Confetti from "react-confetti";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Head from "next/head";
import SelectDropdown from "@/components/SelectDropdown";
import ReactCompareImage from "react-compare-image";
import { UploadDropzone } from 'react-uploader';
import { Uploader } from "uploader";
import { useWindowSize } from "react-use";
import { useRouter } from 'next/router';
import CircularWithValueLabel from "@/components/CircularProgressWithLabel";
import { useSession } from "next-auth/react";


const uploader = Uploader({
    apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
        ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
        : "free",
});



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




    // useEffect(() => {
    //   if (userPlanStatus && userPlan === null) {
    //     console.log("fetchedPlan in", userPlan)
    //     router.push("/price");
    //   }
    // }, [userPlan, router]);
    const uploaderOptions = {
        maxFileCount: 1,
        mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
        editor: {
            images:
            {
                crop: false,
                cropRatio: 1
            }
        },
        metadata: {
            "myCustomField1": true,
            "myCustomField2": {
                "hello": "world"
            },
        },
        styles: {
            colors: {
                'active': '#000',
                "error": "red",
                "primary": "#000",
                "shade100": "#000",
                "shade200": "#fff",
                "shade300": "#000",
                "shade400": "#000", // drag and drop text
                "shade500": "#fff",
                "shade600": "transparent",
                "shade700": "#fff",
                "shade800": "#fff",
                "shade900": "#fff" //upload an image text 
            },
        },
        showFinishButton: false,
    }

    // const fileUrl = context.fileUrl;
    // async function generatePhoto(fileUrl) { // Call the function to generate the photo after click on the button i.e click to go
    //     await new Promise((resolve) => setTimeout(resolve, 500));
    //     setLoading(true);
    //     const res = await fetch("/api/generateDesignRoom", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ imageUrl: fileUrl, prompt: prompt, apiName: "aiHomeMakeOver" }),
    //     });
    //     let result = await res.json();
    //     console.log("NewPhoto", result)
    //     if (res.status !== 200) {
    //         setError(result);
    //         setLoadCircularProgress(true)
    //     } else {
    //         if (userPlan) {
    //             const updateResponse = await fetch(`/api/dataFetchingDB/updateData?userId=${session?.user.id}`);
    //             if (!updateResponse.ok) {
    //                 throw new Error('Failed to update user plan');
    //             }
    //             console.log("updateResponse", updateResponse)

    //             const historyResponse = await fetch('/api/dataFetchingDB/updateHistory', {
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

    //             console.log("historyResponse", historyResponse)
    //             if (!historyResponse.ok) {
    //                 throw new Error('Failed to create history entry');
    //             }
    //         }
    //         setRestoredPhoto(result.output[1]);
    //         setError(null)
    //         setLoadCircularProgress(false)
    //     }
    //     setLoading(false);
    // }


    async function generatePhoto(fileUrl) {
        setLoading(true);
        let count = 0;
        try {
            const timeCount = setInterval(() => {
                count++
            }, 1000);

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
                    console.log("response", data)

                    webhookDBResponse = data;
                    if (data.webhookData.output[0][1]) {
                        clearInterval(timeCount);
                        if (userPlan) {

                            const response = await fetch(`/api/dataFetchingDB/updateData?userId=${session?.user.id}`);
                            if (!response.ok) {
                                throw new Error('Failed to fetch plan data');
                            }
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
                            // console.log("history", history)
                            if (!history.ok) {
                                throw new Error('Failed to fetch plan data');
                            }
                        }
                        setRestoredPhoto(data.webhookData.output[0][1]);
                    }

                } else {
                    if (count > 99) {
                        clearInterval(timeCount);
                        const cancelResponse = await fetch(`/api/replicatePredictionWebhook/cancelPrediction?replicateId=${replicateImageId}`);
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
                console.log(error);
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

    if (userPlan?.remainingPoints === 0 || userPlan?.remainingPoints < 0 || userPlan === null) {
        return <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1em', flexDirection: 'column' }}>
            <h4>Uh Oh ! It look like You Don't Have much credit points to run this model</h4>
            <Button variant="contain" sx={{ border: '1px solid teal' }} onClick={() => { router.push('/price') }}>Buy Credits</Button>
        </Box>
    }

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
                style={{ display: "flex", justifyContent: "center" }}
            >
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
                                    <div className="uploader-custom-border" >
                                        {/* <UploaderComponent requireValuePrompt={requireValuePrompt} fileUrl={fileUrl} setFileUrl={setFileUrl} /> */}
                                        <UploadDropzone
                                            uploader={uploader}
                                            options={uploaderOptions}
                                            onUpdate={files => {
                                                if (files.length > 0) {
                                                    setFileUrl(files.map(x => x.fileUrl).join("\n"));
                                                }
                                            }}
                                            // onComplete={files => alert(files.map(x => x.fileUrl).join("\n"))
                                            // }
                                            height="45vh"
                                            border="5px"
                                        />

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
                                                {!matches && <span class="before-after-badge">Before</span>}
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
                                                {restoredPhoto && !matches && <span class="before-after-badge">After</span>}
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
