import { Box, CircularProgress, Container, Typography } from '@mui/material'
import ToggleButtonContainer from '@/components/toggleButtonContainer';
import UploaderComponent from '@/components/uploaderComponent';
import OriginalImage from '@/components/originalImage';
import React, { useContext, useEffect, useState, useRef } from 'react';
import AppContext from '@/components/AppContext';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import Image from 'next/image';
import axios from 'axios';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Head from 'next/head';

function MotionBlur() {
  const context = useContext(AppContext);
  const [motionBlurImage, setMotionBlurImage] = useState("");
  const [clickToSubmitButton, setClickToSubmitButton] = useState(false);
  const [toggleClick, setToggleClick] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalImageHeight, setOriginalImageHieght] = useState(0);
  const [originalImageWidth, setOriginalImageWidth] = useState(0);
  // const { width, height } = useWindowSize()
  const [error, setError] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [restoreImageCompleteLoaded, setRestoreImageCompleteLoaded] = useState(false);
  console.log(isImageLoaded);
  const [height, setHeight] = useState(null);
  const [width, setWidth] = useState(null);
  const confetiRef = useRef(null);
  const fileUrl = context.fileUrl;

  // for mui responsive for uploader in mobile view
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  // console.log(matches +"matches");



  async function generatePhoto(fileUrl) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(true);
    const res = await fetch("/api/generateMotionImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: fileUrl }),
    });
    let newPhoto = await res.json();
    if (res.status !== 200) {
      setError(newPhoto);
    } else {
      setMotionBlurImage(newPhoto);
    }
    setLoading(false);
  }
  useEffect(() => {
    if (fileUrl && clickToSubmitButton) {
      generatePhoto(fileUrl);
    }
  }, [fileUrl, clickToSubmitButton]);

  const handleSubmitButton = () => {
    setClickToSubmitButton(false);
    setLoading(true);
    generatePhoto(fileUrl);
  }
  //  DownLoad Images 
  const handleDownloadFile = () => {
    // Use Axios to download the file
    axios({
      url: motionBlurImage,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute('download', 'image.jpg'); // set the file name
      document.body.appendChild(link);
      link.click();
    }).catch((error) => {
      console.log(error);
    });
  }


  useEffect(() => {
    if (fileUrl) {
      setHeight(confetiRef.current.clientHeight);
      setWidth(confetiRef.current.clientWidth);
    }
  }, [fileUrl]);

  return (
    <>
      <Head>
        <title> Remove Motion Blur Effect | PicFix.AI </title>
        <meta name="description" content=": PicFix.AI is an advanced image enhancement tool that specializes in removing motion blur from images. Enhance the quality of your motion blur images effortlessly and restore clarity with our powerful AI-driven technology. Try PicFix.AI today!" />
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
      <main className='aiModels' style={{ display: 'flex', justifyContent: 'center' }}>
        <Container maxWidth='xl' >
          <Typography variant="h2" sx={{ paddingTop: '30px', fontSize: '3rem', fontWeight: '700', marginBottom: '5px', color: ' #000', lineHeight: '50px', textAlign: 'center' }} >
            Motion Blur
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: '500', marginBottom: '25px', color: ' #0e0e0e', textAlign: 'center' }}>
            Turn your blurry memories into crystal-clear masterpiece
          </Typography>

          <div className='flex-container flex-column '>
            <div className='flex-container'>
              {fileUrl && <div style={{ visibility: !motionBlurImage ? 'hidden' : 'visible' }}>
                {!motionBlurImage || <ToggleButtonContainer toggleClick={toggleClick} setToggleClick={setToggleClick} />}
              </div>}
              {!fileUrl && (
                <div className="uploader-custom-border">
                  <UploaderComponent />
                </div>
              )}
            </div>

            {!toggleClick ?
              <>
                {fileUrl && <div className='imageContainer  box-container ' ref={confetiRef}>
                  {fileUrl &&
                    <div id="uploadedImage" className="originalImage">
                      <OriginalImage setOriginalImageHieght={setOriginalImageHieght} setOriginalImageWidth={setOriginalImageWidth} setIsImageLoaded={setIsImageLoaded} />
                    </div>
                  }
                  <div className='restoredImageContainer' style={fileUrl &&
                    loading == false &&
                    !motionBlurImage && matches &&
                    originalImageHeight
                    ? { border: "2px dotted black", borderRadius: "5px" }
                    : null
                  } >
                    {
                      fileUrl && matches && loading === false && !motionBlurImage && originalImageHeight ?
                        <div className="uploaderInRestoredImageContainer" style={{
                          // display:'none',
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: originalImageHeight,
                        }}>
                          <UploaderComponent />
                        </div> : null}
                    {loading === true &&
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
                    }
                    <div className="restoredImage">
                      <Image src={motionBlurImage} alt='Restored Image' onLoadingComplete={(e) => { setRestoreImageCompleteLoaded(true) }} style={{ borderRadius: '5px', width: '100%', height: '100%', display: !motionBlurImage && 'none', order: 2 }} width={400} height={200} />
                    </div>
                  </div>
                  {restoreImageCompleteLoaded && motionBlurImage && (

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
                }
                {fileUrl && loading === false && !motionBlurImage && <div className='submit-btn' >
                  <button onClick={handleSubmitButton} > <Typography sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.5em', fontSize: '20px' }} >Lets Go   <AutoFixHighIcon fontSize="small" />  </Typography>  </button>
                </div>}
              </>
              :
              <Box maxWidth='sm' sx={{
                margin: '1em', height: originalImageHeight, width: '100%', padding: '10px', borderRadius: '5px', boxShadow: ' 0 2px 10px rgba(0, 0, 0, 0.3)'
              }} >
                {fileUrl && <ReactCompareSlider
                  portrait={true}
                  itemOne={<ReactCompareSliderImage src={fileUrl} alt="Image one" />} itemTwo={<ReactCompareSliderImage src={motionBlurImage} alt="Image two" />} style={{ width: "100%", height: "100%" }} />}
              </Box>}
            {motionBlurImage &&
              <div className='upload-download-button' style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '30px' }}>
                <button style={{ marginLeft: '20px' }} onClick={() => {
                  setMotionBlurImage('');
                  context.setFileUrl('');
                  setToggleClick(!toggleClick);
                  setOriginalImageWidth(0);
                  setOriginalImageHieght(0);
                  window.location.reload();
                }}>Upload New</button>
                <button style={{ cursor: 'pointer' }} onClick={handleDownloadFile} >Download image</button>
              </div>
            }
          </div>
        </Container >
      </main>
    </>
  )
}

export default MotionBlur;


