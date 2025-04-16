import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import AppContext from "@/components/AppContext";
import Head from "next/head";
import ImageComponent from "@/components/imageComponent";
import ImageStrip from '@/components/ImageStrip';
import JSZip from 'jszip';
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Uploader from "@/components/uploadContainerbase64/Uploader";


function ImageColorization() {
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
  const setFileUrl = context.setFileUrl;
  const [loadCircularProgress, setLoadCircularProgress] = useState(false);
  const [loadindSession, setLoadindSession] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userPlan, setUserPlan] = useState('');
  const [userPlanStatus, setUserPlanStatus] = useState(false);

  const { timerForRunModel } = useContext(AppContext);
  const timerForRunModelRef = useRef(timerForRunModel);
  useEffect(() => {
    timerForRunModelRef.current = timerForRunModel;
  }, [timerForRunModel]);


  const fetchUserPlan = async () => {
    try {
      const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch plan data');
      }
      const data = await response.json();
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
      // fetchUserPlan();
    }
  }, [session, status, router]);


  // CJWBW model calling
  async function generateCJWBWPhoto(toSwitchRestoreUrl) {
    try {
      const res = await fetch("/api/replicatePredictionWebhook/getPrediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: toSwitchRestoreUrl, apiName: 'imageColorization' }),
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
          if (data.webhookData.output[0]) {
            // if (userPlan) {

            //   const response = await fetch(`/api/dataFetchingDB/updateData?userId=${session?.user.id}`);
            //   const newCreditpoints = await response.json();
            //   context.setCreditPoints(newCreditpoints.saveCreditPoint.remainingPoints)
            //   if (!response.ok) {
            //     throw new Error('Failed to fetch plan data');
            //   }
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
            //   if (!history.ok) {
            //     throw new Error('Failed to fetch plan data');
            //   }
            // }
            // setRestoredPhoto(data.webhookData.output[0]);
            setRestoredPhoto(toSwitchRestoreUrl);
            setimageColorization(data.webhookData.output[0][0].image);
            setimageColorizationOne(data.webhookData.output[0][1].image)
            setimageColorizationTwo(data.webhookData.output[0][2].image)
            setimageColorizationThree(data.webhookData.output[0][3].image)
            setimageColorizationFour(data.webhookData.output[0][4].image)
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


  async function generateRestorePhoto(fileUrl) {
    setLoading(true);

    try {

      const res = await fetch("/api/replicatePredictionWebhook/getPrediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: fileUrl, apiName: 'restorePhoto' }),
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
          const data = await response.json()

          webhookDBResponse = data;
          let toSwitchRestoreUrl = data.webhookData.output[0];
          generateCJWBWPhoto(toSwitchRestoreUrl);
          setRestoreImageURLForVarient(toSwitchRestoreUrl);
          // }

        } else {
          if (timerForRunModelRef.current > 99) {
            await fetch(`/api/replicatePredictionWebhook/cancelPrediction?replicateId=${replicateImageId}`);
            setError("true");
            setLoadCircularProgress(true)
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
    catch (error) {
      console.error('Error generating photo==>', error);
      setError(error.message);
    }
  }
  useEffect(() => {
    if (fileUrl) {
      generateRestorePhoto(fileUrl);
    }
  }, [fileUrl]);


  // if (userPlan?.remainingPoints === 0 || userPlan?.remainingPoints < 0 || userPlan === null) {
  //   return router.push('/price')
  // }


  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
        // Check if the file is HEIF/HEIC
        if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
            try {
                // Dynamically import heic2any only on the client side
                const heic2any = (await import('heic2any')).default;
                
                // Convert HEIF/HEIC to JPG
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8
                });
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFileUrl(e.target.result);
                };
                reader.readAsDataURL(convertedBlob);
            } catch (error) {
                console.error('Error converting HEIF/HEIC image:', error);
                setError('Failed to convert HEIF/HEIC image');
            }
        } else {
            // Handle regular images
            const reader = new FileReader();
            reader.onload = (e) => {
                setFileUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
};

  return (
    <>
      <Head>
        <title> Image Colorization | PicFix.AI </title>
        <meta name="description" content="Revive your old black and white memories with vibrant colors using our AI-powered colorization model. Transform old photographs into vivid representations of cherished moments, preserving the beauty and nostalgia of the past." />
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
      {/* {userPlanStatus ? <>    */}
      <div style={{ paddingBottom: '1px' }} id="ClickToUp"> </div>
        <main className='aiModels' style={{ display: 'flex', justifyContent: 'center' }} id="ClickToUp">
          <Container maxWidth='xl' >
            <Typography variant="h2" sx={{ paddingTop: '30px', fontSize: '3rem', fontWeight: '700', marginBottom: '5px', color: ' #000', lineHeight: '50px', textAlign: 'center' }} >
              Image Colorization
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: '500', color: ' #0e0e0e', textAlign: 'center' }}>
              Adding a Splash of Color to Black and White Memories
            </Typography>
            {!fileUrl && <Box display='flex' justifyContent='center'>
              <Uploader handleImageUpload={handleImageUpload} />
            </Box>}
            <ImageComponent setFileUrl={setFileUrl} setLoadCircularProgress={setLoadCircularProgress} loadCircularProgress={loadCircularProgress} loading={loading} setLoading={setLoading} error={error} setError={setError} fileUrl={fileUrl} restoredPhoto={restoredPhoto} setRestoredPhoto={setRestoredPhoto} imageColorization={imageColorization} restoreImageURLForVarient={restoreImageURLForVarient} imageColorizationOne={imageColorizationOne} imageColorizationTwo={imageColorizationTwo} imageColorizationThree={imageColorizationThree} imageColorizationFour={imageColorizationFour} />
          </Container >
        </main></>

    //     : <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1em', flexDirection: 'column' }}>
    //       <CircularProgress />
    //     </Box>}
    // </>
  )
}

export default ImageColorization;


