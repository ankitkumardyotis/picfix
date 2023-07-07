import { Box, CircularProgress, Container, Input, TextField, Typography } from "@mui/material";
import ToggleButtonContainer from "@/components/toggleButtonContainer";
import UploaderComponent from "@/components/uploaderComponent";
import OriginalImage from "@/components/originalImage";
import React, { useContext, useRef, useEffect, useState, useMemo } from "react";
import AppContext from "@/components/AppContext";
import { ReactCompareSlider, ReactCompareSliderImage, } from "react-compare-slider";
import Image from "next/image";
import axios from "axios";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Head from "next/head";
import SelectDropdown from "@/components/SelectDropdown";
import ReactCompareImage from "react-compare-image";


function ClothingFashion() {
    const context = useContext(AppContext);
    const [restoredPhoto, setRestoredPhoto] = useState("");
    const [clickToSubmitButton, setClickToSubmitButton] = useState(false);
    const [toggleClick, setToggleClick] = useState(false);
    const [loading, setLoading] = useState(false);
    const [originalImageHeight, setOriginalImageHieght] = useState(0);
    const [originalImageWidth, setOriginalImageWidth] = useState(0);
    // const { width, height } = useWindowSize()
    const [error, setError] = useState(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [restoreImageCompleteLoaded, setRestoreImageCompleteLoaded] = useState(false);
    const [originalImageByReplicate, setOriginalImageByReplicate] = useState('');
    const [prompt, setPrompt] = useState('');
    const [clothingPosition, setClothingPosition] = useState('');
    // console.log(originalImageByReplicate)
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    // console.log(matches +"matches");

    const [height, setHeight] = useState(null);
    const [width, setWidth] = useState(null);
    const confetiRef = useRef(null);

    const fileUrl = context.fileUrl;
    async function generatePhoto(fileUrl) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoading(true);
        const res = await fetch("/api/generateClothingFashion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageUrl: fileUrl, prompt: prompt, clothingPosition: clothingPosition }),
        });
        let newPhoto = await res.json();
        console.log("NewPhoto", newPhoto)
        if (res.status !== 200) {
            setError(newPhoto);
        } else {
            setOriginalImageByReplicate(newPhoto[0]);
            setRestoredPhoto(newPhoto[3]);
        }
        setLoading(false);
    }
    useEffect(() => {
        if (fileUrl ) {
            generatePhoto(fileUrl);
        }
    }, [fileUrl]);

    // const handleSubmitButton = () => {
    //     setClickToSubmitButton(false);
    //     setLoading(true);
    //     generatePhoto(fileUrl);

    // };

    useEffect(() => {
        if (fileUrl) {
            setHeight(confetiRef.current.clientHeight);
            setWidth(confetiRef.current.clientWidth);
        }
    }, [fileUrl]);

    const handleInputChange = (event) => {
        setPrompt(event.target.value);
    };

    console.log(prompt);
    return (
        <>
            <Head>
                <title>Trendy Look | PicFix.AI </title>
                <meta name="description" content=" PicFix offers professional trendy Look services to change the color of cloth and enhance the quality of your cherished photographs. Get started today!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/assets/logo.png" />
                {/* <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}></script>
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
                /> */}
            </Head>
            <main
                className="aiModels"
                style={{ display: "flex", justifyContent: "center" }}
            >
                <Container maxWidth="xl">
                    <Typography variant="h2" sx={{ paddingTop: "30px", fontSize: "3rem", fontWeight: "700", marginBottom: "5px", color: " #000", lineHeight: "50px", textAlign: "center", }}>
                      Trendy Look Ai
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "500", marginBottom: "5px", color: " #0e0e0e", textAlign: "center", }}>
                        Be The Next Fashion Designer
                    </Typography>
                    {!restoredPhoto && !fileUrl &&
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: matches ? 'row' : 'column' }}>
                            <SelectDropdown clothingPosition={clothingPosition} setClothingPosition={setClothingPosition} />
                            <TextField onChange={handleInputChange} sx={{ minWidth: matches ? 320 : '70%', margin: '20px' }} id="clothingText" label="Describe the clothing item you want to create." variant="outlined" placeholder="Ex. A black Shirt" />
                        </Box>
                    }

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
                            {!fileUrl && (
                                <div className="uploader-custom-border">
                                    <UploaderComponent />
                                </div>
                            )}
                        </div>

                        {toggleClick === false ? (
                            <>
                                {fileUrl && (
                                    <div
                                        className="imageContainer box-container"
                                        ref={confetiRef}
                                        style={{ position: "relative" }}
                                    >
                                        {fileUrl && (
                                            <div id="uploadedImage" className="originalImage" style={{ position: 'relative' }}>
                                                {!originalImageByReplicate ? <OriginalImage
                                                    setOriginalImageHieght={setOriginalImageHieght}
                                                    setOriginalImageWidth={setOriginalImageWidth}
                                                    setIsImageLoaded={setIsImageLoaded}
                                                /> :
                                                    <img src={originalImageByReplicate} alt="Original Image By Replicate" style={{ width: '100%', height: '100%' }} />
                                                }
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
                                            {/* {fileUrl && matches &&
                                                loading == false &&
                                                !restoredPhoto &&
                                                originalImageHeight ? (
                                                <div
                                                    className="uploaderInRestoredImageContainer"
                                                    style={{

                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        height: originalImageHeight,
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <UploaderComponent />
                                                        {!restoredPhoto &&
                                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: 'row' }}>
                                                                <SelectDropdown clothingPosition={clothingPosition} setClothingPosition={setClothingPosition} />
                                                                <TextField onChange={handleInputChange} sx={{ minWidth: 320, margin: '20px' }} id="clothingText" label="Describe the clothing item you want to create." variant="outlined" placeholder="Ex. A black Shirt" />
                                                            </Box>
                                                        }
                                                    </div>

                                                </div>
                                            ) : null} */}
                                            {loading === true && (
                                                <div
                                                    style={matches ? {
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        height: originalImageHeight ? originalImageHeight : "100%",
                                                    } : { display: "flex", justifyContent: 'center' }}
                                                >
                                                    {" "}
                                                    <CircularProgress color="inherit" />
                                                </div>
                                            )}
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

                                {/* {fileUrl && loading === false && !restoredPhoto && (
                                    <div className="submit-btn">
                                        <button onClick={handleSubmitButton}>
                                            {" "}
                                            <Typography
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    gap: ".5em",
                                                    fontSize: "20px",
                                                }}
                                            >
                                                Lets Go <AutoFixHighIcon fontSize="small" />{" "}
                                            </Typography>{" "}
                                        </button>
                                    </div>
                                )} */}
                            </>
                        ) : (
                            <Box
                                maxWidth="sm"
                                sx={{
                                    margin: "1em",
                                    height: originalImageHeight,
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "5px",
                                    boxShadow: " 0 2px 10px rgba(0, 0, 0, 0.3)",
                                }}
                            >
                                {fileUrl && (
                                    <ReactCompareImage leftImageLabel='before' leftImage={fileUrl }rightImageLabel='after' rightImage={restoredPhoto} />
                                )}
                            </Box>
                        )}
                        {restoredPhoto && (
                            <div
                                className="upload-download-button"
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "30px",
                                }}
                            >
                                <button
                                    onClick={() => {
                                        setRestoredPhoto("");
                                        context.setFileUrl("");
                                        setToggleClick(event.target.checked);
                                        setOriginalImageWidth(0);
                                        setOriginalImageHieght(0);
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
                            </div>
                        )}
                    </div>
                </Container>
            </main >
        </>
    );
}

export default ClothingFashion;
