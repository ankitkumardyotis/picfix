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
























































