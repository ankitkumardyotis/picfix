import { Container, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import AppContext from "@/components/AppContext";
import Head from "next/head";
import ImageComponent from "@/components/imageComponent";
import ImageStrip from '@/components/ImageStrip';
import JSZip from 'jszip';


function imageColorization() {
  const context = useContext(AppContext);
  const [restoredPhoto, setRestoredPhoto] = useState('');
  const [imageColorization, setimageColorization] = useState();
  const [imageColorizationOne, setimageColorizationOne] = useState('');
  const [imageColorizationTwo, setimageColorizationTwo] = useState('');
  const [imageColorizationThree, setimageColorizationThree] = useState('');
  const [imageColorizationFour, setimageColorizationFour] = useState('');
  const [restoreImageURLForVarient, setRestoreImageURLForVarient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileUrl = context.fileUrl;


  // CJWBW model calling
  async function generateCJWBWPhoto(toSwitchRestoreUrl) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(true);
    const res = await fetch("/api/generateColorizationImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: toSwitchRestoreUrl }),
    });
    let newPhoto = await res.json();
    if (res.status !== 200) {
      setError(newPhoto);
    } else {
      setRestoredPhoto(toSwitchRestoreUrl);
      setimageColorization(newPhoto[0].image);
      console.log(newPhoto);
      setimageColorizationOne(newPhoto[1].image)
      setimageColorizationTwo(newPhoto[2].image)
      setimageColorizationThree(newPhoto[3].image)
      setimageColorizationFour(newPhoto[4].image)
      setLoading(false)
    }
  }

  // GFPGAN model calling 
  async function generateRestorePhoto(fileUrl) {
    console.log(" url for gfpgan", fileUrl);
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
    } else {
      let toSwitchRestoreUrl = newPhoto;
      generateCJWBWPhoto(toSwitchRestoreUrl);
      setRestoreImageURLForVarient(newPhoto);
    }
    // setLoading(false);
  }

  useEffect(() => {
    if (fileUrl) {
      generateRestorePhoto(fileUrl);
    }
  }, [fileUrl]);


  return (
    <>
      <Head>
        <title> Remove Motion Blur Effect | PicFix.AI </title>
        <meta name="description" content=": PicFix is an advanced image enhancement tool that specializes in removing motion blur from images. Enhance the quality of your motion blur images effortlessly and restore clarity with our powerful AI-driven technology. Try PicFix today!" />
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
            Image Colorization
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: '500', color: ' #0e0e0e', textAlign: 'center' }}>
            Adding a Splash of Color to Black and White Memories
          </Typography>
          {/* <div className='flex-container flex-column '>
            <div className='flex-container'>
              {fileUrl && (
                <div style={{ visibility: !imageColorization ? "hidden" : "visible" }}>
                  {!RestoreImageUrl && imageColorization || (
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
                {fileUrl && <div className='imageContainer  box-container ' ref={confetiRef} >
                  {fileUrl &&
                    <div id="uploadedImage" className="originalImage" style={{ position: 'relative' }}>
                      <OriginalImage setOriginalImageHieght={setOriginalImageHieght} setOriginalImageWidth={setOriginalImageWidth} setIsImageLoaded={setIsImageLoaded} />
                      {!matches && <span class="before-after-badge">Before</span>}
                    </div>
                  }
                  <div className='restoredImageContainer' style={fileUrl &&
                    loading == false &&
                    !imageColorization && matches &&
                    originalImageHeight
                    ? { border: "2px dotted black", borderRadius: "5px" }
                    : null
                  } >
                    {
                      fileUrl && matches && loading === false && !imageColorization && originalImageHeight ?
                        <div className="uploaderInRestoredImageContainer" style={{
                          // display:'none',
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: originalImageHeight,
                        }}>
                          <UploaderComponent />
                        </div> :
                        null
                    }

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
                    {
                      fileUrl && imageColorization &&

                      <div className="restoredImage" style={{ position: 'relative' }}>
                        <Image
                          src={RestoreImageUrl}
                          alt="Restored Image"
                          onLoadingComplete={(e) => {
                            setRestoreImageCompleteLoaded(true);
                          }}
                          style={{
                            borderRadius: "5px",
                            width: "100%",
                            height: "100%",
                            display: !RestoreImageUrl && "none",
                            order: 2,
                          }}
                          width={400}
                          height={200}
                        />
                        {RestoreImageUrl && !matches && <span class="before-after-badge">After</span>}
                      </div>
                    }
                  </div>

                  {restoreImageCompleteLoaded && imageColorization && (
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

                {fileUrl && loading === false && !imageColorization && <div className='submit-btn' >
                  <button onClick={handleSubmitButton} > <Typography sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.5em', fontSize: '20px' }} >Lets Go   <AutoFixHighIcon fontSize="small" />  </Typography>  </button>
                </div>}

              </>
            ) : (
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

                  <Box sx={{ width: '100%', height: '100%' }}>
                    <ReactCompareImage leftImageLabel='before' leftImage={fileUrl} rightImageLabel='after' rightImage={RestoreImageUrl} />
                  </Box>
                )}
              </Box>
            )}
            {
              fileUrl && imageColorization &&
              <ImageStrip setRestoreImageUrl={setRestoreImageUrl} restoreImageURLForVarient={restoreImageURLForVarient} imageColorizationOne={imageColorizationOne} imageColorization={imageColorization} imageColorizationTwo={imageColorizationTwo} imageColorizationThree={imageColorizationThree} imageColorizationFour={imageColorizationFour} />
            }


            {imageColorization &&
              <div className='upload-download-button' style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '30px' }}>
                <button style={{ marginLeft: '20px' }} onClick={() => {
                  setimageColorization('');
                  context.setFileUrl('');
                  setToggleClick(!toggleClick);
                  setOriginalImageWidth(0);
                  setOriginalImageHieght(0);
                  window.location.reload();
                }}>Upload New</button>
                <button style={{ cursor: 'pointer' }} onClick={handleDownloadFile} >Download image</button>
              </div>
            }
          </div> */}
          <ImageComponent fileUrl={fileUrl} restoredPhoto={restoredPhoto} setRestoredPhoto={setRestoredPhoto} loading={loading} setLoading={setLoading} imageColorization={imageColorization} restoreImageURLForVarient={restoreImageURLForVarient} imageColorizationOne={imageColorizationOne} imageColorizationTwo={imageColorizationTwo} imageColorizationThree={imageColorizationThree} imageColorizationFour={imageColorizationFour} />
        </Container >
      </main>
    </>
  )
}

export default imageColorization;


