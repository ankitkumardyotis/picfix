import { Alert, Box, Button, CircularProgress, Container, Input, Snackbar, Stack, TextField, Typography } from "@mui/material";
import ToggleButtonContainer from "@/components/toggleButtonContainer";
import UploaderComponent from "@/components/uploaderComponentForTrendyLook";
import OriginalImage from "@/components/originalImageForTrendyLook";
import React, { useContext, useRef, useEffect, useState, useMemo } from "react";
import AppContext from "@/components/AppContext";
import { ReactCompareSlider, ReactCompareSliderImage, } from "react-compare-slider";
import Image from "next/image";
import axios from "axios";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Head from "next/head";
import SelectDropdown from "@/components/SelectDropdown";
import ReactCompareImage from "react-compare-image";
import JSZip, { file } from "jszip";
import { useRouter } from "next/router";
import CircularWithValueLabel from "@/components/CircularProgressWithLabel";


function ClothingFashion() {
    const confetiRef = useRef('');
    const router = useRouter();
    // const context = useContext(AppContext);
    const [restoredPhoto, setRestoredPhoto] = useState("");
    const [clickToSubmitButton, setClickToSubmitButton] = useState(false);
    const [toggleClick, setToggleClick] = useState(false);
    const [loading, setLoading] = useState(false);
    const [originalImageHeight, setOriginalImageHieght] = useState(0);
    const [originalImageWidth, setOriginalImageWidth] = useState(0);
    const [cropUploadedImage, setcropUploadedImage] = useState(true);
    const [focusOnInputField, setFocusOnInputField] = useState(false);
    const [requireValuePrompt, setRequireValuePrompt] = useState(false);
    const [ClicktoGo, setClicktoGo] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [highlight, setHighlight] = useState(false);
    const [fileUrl, setFileUrl] = useState('');
    // const { width, height } = useWindowSize()
    const [error, setError] = useState(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [restoreImageCompleteLoaded, setRestoreImageCompleteLoaded] = useState(false);
    const [originalImageByReplicate, setOriginalImageByReplicate] = useState('');
    const [prompt, setPrompt] = useState('');
    const [clothingPosition, setClothingPosition] = useState('');
    const [loadCircularProgress, setLoadCircularProgress] = useState(false);
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    // const fileUrl = context.fileUrl;

    const { width, height } = useWindowSize();





    // GFPGAN model calling 
    async function generateRestorePhoto(urlFromColorization) {
        console.log(" url for gfpgan", urlFromColorization);
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
      
        const res = await fetch("/api/generateRestoreImage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageUrl: urlFromColorization[3] }),
        });
        let newPhoto = await res.json();
        if (res.status !== 200) {
            setError(newPhoto);
            setLoadCircularProgress(true)
        } else {
            setRestoredPhoto(newPhoto);
            setOriginalImageByReplicate(newPhoto[0]);
            setError(null)
            setLoadCircularProgress(false)
        }
        setLoading(false);
    }

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
        if (res.status !== 200) {
            setError(newPhoto);
            setLoadCircularProgress(true)
        } else {
            const urlFromColorization = newPhoto;
            generateRestorePhoto(urlFromColorization);
            setError(null)
            setLoadCircularProgress(false)
            // setOriginalImageByReplicate(newPhoto[0]);
        }
    }




    const handleInputChange = (event) => {
        setPrompt(event.target.value);
        setRequireValuePrompt(event.target.value.length == 0 ? false : true);
        setInputValue(event.target.value);
        setHighlight(false);

    };
    //  DownLoad Images with Zip if multiple images available 

    const handleDownloadFile = () => {
        console.log("you are in download function");
        // Define an array of image URLs
        let imageUrls = [restoredPhoto];
        // Create a new instance of JSZip
        const zip = new JSZip();

        // Filter out undefined values from the imageUrls array
        const filteredUrls = imageUrls.filter(url => url !== undefined);

        // Check if there are multiple images
        if (filteredUrls.length > 1) {
            // Create an array of promises to download each image
            const downloadPromises = filteredUrls.map((imageUrl, index) => {
                return axios.get(imageUrl, { responseType: 'blob' })
                    .then(response => {
                        // Add the downloaded image to the zip folder
                        zip.file(`image${index}.jpg`, response.data);
                    })
                    .catch(error => {
                        console.error(`Error downloading image ${index}:`, error);
                    });
            });

            // Wait for all the download promises to resolve
            Promise.all(downloadPromises)
                .then(() => {
                    // Generate the zip folder
                    return zip.generateAsync({ type: 'blob' });
                })
                .then(content => {
                    // Create a link element to trigger the download
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(content);
                    link.download = 'images.zip';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                })
                .catch(error => {
                    console.error('Error creating zip folder:', error);
                });
        } else if (filteredUrls.length === 1) {
            // Download the single image directly
            const imageUrl = filteredUrls[0];

            axios.get(imageUrl, { responseType: 'blob' })
                .then(response => {
                    // Create a link element to trigger the download
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(response.data);
                    link.download = 'image.jpg';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                })
                .catch(error => {
                    console.error('Error downloading image:', error);
                });
        } else {
            console.error('No valid image URLs found.');
        }
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
            setTimeout(() => {
                if (!restoredPhoto) {
                    setError("true");
                    setLoadCircularProgress(true)
                }

            }, "100000")
            setClicktoGo(true)

        } else {
            setFocusOnInputField(true);
        }
    };


    const handleToNavigatePrompt = () => {
        setClicktoGo(false);
        setOriginalImageByReplicate('');
        setRestoredPhoto('');
        setRequireValuePrompt(false);
    }
    const imageStyle = {
        borderRadius: '5px',
        width: '100%',
        height: '100%',
    };

    return (
        <>
            <Head>
                <title>Trendy Look | PicFix.AI </title>
                <meta name="description" content=" PicFix offers professional trendy Look services to change the color of cloth and enhance the quality of your cherished photographs. Get started today!" />
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

                    <Typography variant="h2" sx={{ paddingTop: "30px", fontSize: "3rem", fontWeight: "700", marginBottom: "5px", color: " #000", lineHeight: "50px", textAlign: "center", }}>
                        Trendy Look Ai
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "500", marginBottom: "5px", color: " #0e0e0e", textAlign: "center", }}>
                        Be The Next Fashion Designer
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
                                        <UploaderComponent requireValuePrompt={requireValuePrompt} fileUrl={fileUrl} setFileUrl={setFileUrl} />

                                    </div>
                                    <p style={{ textAlign: 'center', marginTop: '.5em', maxWidth: '30rem' }}>
                                        <b><i> **Please upload a photo of your clothing item </i></b></p>
                                </div>

                            ) : (
                                ClicktoGo === false && (
                                    <div >
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: matches ? 'row' : 'column' }}>
                                            <SelectDropdown sx={{ marginLeft: '-10px' }} clothingPosition={clothingPosition} setClothingPosition={setClothingPosition} />
                                            <TextField onChange={handleInputChange} sx={{ minWidth: matches ? 320 : '100%', margin: '20px', borderColor: 'none', border: highlight ? '2px solid red' : '' }} id="clothingText" label="Your preffered clothing style" variant="outlined" placeholder="Ex. A black Shirt" />
                                            <Button variant="contained" onClick={handleClicktoGo} sx={{ width: matches ? '' : '100%', marginLeft: matches ? '-10px' : '', padding: '11px', boxShadow: 'none', backgroundColor: 'black', fontSize: '1.2em' }} >Go</Button>
                                        </Box>
                                        <Box sx={{ marginTop: matches ? '' : '20px' }}>
                                            <Image style={imageStyle} src={fileUrl} width={550} height={550} alt="Restore image" />
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
                                        ref={confetiRef}
                                        style={{ position: "relative", overflow: 'hidden' }}
                                    >
                                        {fileUrl && (
                                            <div id="uploadedImage" className="originalImage" style={{ position: 'relative' }}>
                                                <OriginalImage setOriginalImageHieght={setOriginalImageHieght} setOriginalImageWidth={setOriginalImageWidth} setIsImageLoaded={setIsImageLoaded} fileUrl={fileUrl} setFileUrl={setFileUrl} />


                                                {matches && <span class="before-after-badge">Before</span>}
                                            </div>
                                        )}
                                        <div className="restoredImageContainer" style={fileUrl && loading == false && !restoredPhoto && !matches && originalImageHeight
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
                                                {restoredPhoto && matches && <span class="before-after-badge">After</span>}
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
                                    flexWrap: "wrap"

                                }}
                            >
                                <button
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        setRestoredPhoto("");
                                        setFileUrl("");
                                        if (toggleClick === true) {
                                            setToggleClick(false);
                                        }
                                        setClicktoGo(false);
                                        setRequireValuePrompt(false);
                                        setClickToSubmitButton(false);
                                        setFocusOnInputField(false);
                                        setInputValue('');
                                        setHighlight(false);
                                        setOriginalImageByReplicate('');
                                        setOriginalImageWidth(0);
                                        setOriginalImageHieght(0);
                                        setLoadCircularProgress(false)
                                        setError(null)
                                        router.push('#clickToUp');
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
                                    onClick={handleToNavigatePrompt}
                                >
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

export default ClothingFashion;
