import React from 'react'
import ToggleButtonContainer from './toggleButtonContainer';
import UploaderComponent from './uploaderComponent';
import OriginalImage from './originalImage';
import { Box, CircularProgress } from '@mui/material';
import Image from 'next/image';
import ReactConfetti from 'react-confetti';
import ReactCompareImage from 'react-compare-image';
import { useContext, useRef, useEffect, useState } from "react";
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import axios from 'axios';
import AppContext from "@/components/AppContext";
import ImageStrip from './ImageStrip';
import JSZip from 'jszip';
import useWindowSize from 'react-use/lib/useWindowSize'
import { useRouter } from 'next/router';
import CircularWithValueLabel from './CircularProgressWithLabel';

function ImageComponent(props) {
    const confetiRef = useRef(null);
    const context = useContext(AppContext);
    const router = useRouter();
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    // const matches = useMediaQuery((theme)=>theme.breakpoints.down('md'));
    const matches = useMediaQuery(theme.breakpoints.down('md').replace(/^@media( ?)/m, '')) ?? false
    const { width, height } = useWindowSize();
    const [toggleClick, setToggleClick] = useState(false);
    const [originalImageHeight, setOriginalImageHieght] = useState(0);
    const [originalImageWidth, setOriginalImageWidth] = useState(0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [restoreImageCompleteLoaded, setRestoreImageCompleteLoaded] = useState(false);


    useEffect(() => {
        if (matches) {
            setToggleClick(true);
        }
    }, [matches]);



    //  DownLoad Images with Zip if multiple images available 

    const handleDownloadFile = () => {
        console.log("you are in download function");
        // Define an array of image URLs
        let imageUrls = [props.restoredPhoto, props.imageColorization, props.imageColorizationOne, props.imageColorizationTwo, props.imageColorizationThree, props.imageColorizationFour, props.restoreImageURLForVarient];
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



    return (
        <>
            <div className="flex-container flex-column">
                <div className="flex-container">
                    {props.fileUrl && (
                        <div style={{ visibility: !props.restoredPhoto ? "hidden" : "visible" }}>
                            {!props.restoredPhoto || (
                                <ToggleButtonContainer
                                    setToggleClick={setToggleClick}
                                    toggleClick={toggleClick}
                                    matches={matches}
                                />
                            )}
                        </div>
                    )}
                    {/* {!props.fileUrl && (
                        <div className="uploader-custom-border">
                            <UploaderComponent cropUploadedImage={props.cropUploadedImage} />
                        </div>
                    )} */}
                </div>

                {toggleClick === false ? (
                    <>
                        {props.fileUrl && (
                            <div
                                className="imageContainer box-container"
                                ref={confetiRef}
                                style={{ position: "relative", overflow: 'hidden' }}
                            >
                                {restoreImageCompleteLoaded && props.restoredPhoto && (
                                    <ReactConfetti
                                        maxHeight={originalImageHeight}
                                        width={width}
                                        height={height}
                                        numberOfPieces={500}
                                        recycle={false}
                                        gravity={0.3}
                                        initialVelocityY={15}
                                    />
                                )}
                                {props.fileUrl && (
                                    <div id="uploadedImage" className="originalImage" style={{ position: 'relative' }}>
                                        <OriginalImage
                                            setOriginalImageHieght={setOriginalImageHieght}
                                            setOriginalImageWidth={setOriginalImageWidth}
                                            setIsImageLoaded={setIsImageLoaded}
                                        />
                                        {!matches && <span class="before-after-badge">Before</span>}
                                    </div>
                                )}
                                <div style={{ border: "2px solid black", height: { height }, opacity: "4%" }}></div>

                                <div className="restoredImageContainer" style={props.fileUrl &&
                                    props.loading === false &&
                                    !props.restoredPhoto && matches &&
                                    originalImageHeight
                                    ? { border: "2px dotted black", borderRadius: "5px" }
                                    : null
                                }
                                >

                                    {props.loading === true && props.error === null ? (
                                        <div
                                            style={!matches ? {
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                height: `${originalImageHeight}px` ? `${originalImageHeight}px` : `${originalImageHeight}px`,
                                            } : { display: "flex", justifyContent: 'center', alignItems: 'center' }}
                                        >
                                            {" "}
                                            {/* <CircularProgress color="inherit" /> */}
                                            <CircularWithValueLabel />
                                        </div>
                                    ) : (!props.restoredPhoto && props.loadCircularProgress === true &&
                                        <div
                                            style={!matches ? {
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
                                                        props.setFileUrl(''),
                                                            props.setRestoredPhoto(''),
                                                            props.setLoadCircularProgress(false)
                                                        props.setLoading(false)
                                                        props.setError(null)
                                                        router.push('#ClickToUp')

                                                    }}>Please Retry
                                                </span>
                                            </h1>
                                        </div>
                                    )}

                                    <div className="restoredImage" style={{ position: 'relative' }}>
                                        <Image
                                            src={props.restoredPhoto}
                                            alt="Restored Image"
                                            onLoadingComplete={(e) => {
                                                setRestoreImageCompleteLoaded(true);
                                            }}
                                            style={{
                                                borderRadius: "5px",
                                                width: "100%",
                                                height: "100%",
                                                display: !props.restoredPhoto && "none",
                                                order: 2,
                                            }}
                                            width={400}
                                            height={200}
                                        />
                                        {props.restoredPhoto && !matches && <span class="before-after-badge">After</span>}
                                    </div>
                                </div>

                            </div>
                        )}

                    </>
                ) : (props.restoredPhoto && props.fileUrl ?

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
                        {props.fileUrl && (
                            <Box sx={{ width: '100%', height: '100%' }}>
                                <ReactCompareImage leftImageLabel='before' leftImage={props.fileUrl} rightImageLabel='after' rightImage={props.restoredPhoto} />
                            </Box>
                        )}

                    </Box>
                    :
                    props.loading === true && props.error === null ? (
                        <div
                            style={matches ? {
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: originalImageHeight ? originalImageHeight : "100%",
                            } : { display: "flex", justifyContent: 'center' }}
                        >
                            {" "}
                            <CircularWithValueLabel />
                        </div>
                    ) : (!props.restoredPhoto && props.loadCircularProgress === true &&
                        <div
                            style={!matches ? {
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: 'column',
                                alignItems: "center",
                                gap: '20px',
                                height: `${originalImageHeight}px` ? `${originalImageHeight}px` : `${originalImageHeight}px`,
                            } : { display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', textAlign: matches ? 'center' : 'center' }}
                        >
                            <p style={{ fontSize: matches ? '80px' : '40px' }}>😭</p>
                            <h1>Server is busy. {matches && <br />}
                                <span style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => {
                                        props.setFileUrl(''),
                                            props.setRestoredPhoto(''),
                                            props.setLoadCircularProgress(false)
                                        props.setLoading(false)
                                        props.setError(null)
                                        router.push('#ClickToUp')

                                    }}>Please Retry
                                </span>
                            </h1>
                        </div>
                    )
                )}
                {
                    props.fileUrl && props.imageColorization &&
                    <ImageStrip setRestoredPhoto={props.setRestoredPhoto} setRestoreImageUrl={props.setRestoreImageUrl} restoreImageURLForVarient={props.restoreImageURLForVarient} imageColorizationOne={props.imageColorizationOne} imageColorization={props.imageColorization} imageColorizationTwo={props.imageColorizationTwo} imageColorizationThree={props.imageColorizationThree} imageColorizationFour={props.imageColorizationFour} />
                }

                {props.restoredPhoto && (
                    <div
                        className="upload-download-button"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "30px",
                            marginTop: "20px"
                        }}
                    >
                        <button
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                props.setRestoredPhoto("");
                                context.setFileUrl("");
                                props.setLoadCircularProgress(false)
                                props.setError(null)
                                if (toggleClick === true) {
                                    setToggleClick(false);
                                }
                                router.push('#ClickToUp');
                                setOriginalImageWidth(0);
                                setOriginalImageHieght(0);


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
        </>
    )
}

export default ImageComponent