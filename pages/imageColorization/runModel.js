import { Container, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import AppContext from "@/components/AppContext";
import Head from "next/head";
import ImageComponent from "@/components/imageComponent";
import ImageStrip from '@/components/ImageStrip';
import JSZip from 'jszip';
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";


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
  // const fetchUserPlan = async () => {
  //   try {
  //     const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch plan data');
  //     }
  //     const data = await response.json();
  //     // console.log("data", data.plan)
  //     // return data.plan;
  //     setUserPlan(data.plan)
  //     setUserPlanStatus(true)
  //   } catch (error) {
  //     console.error('Error fetching plan data:', error);
  //   }
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




  // useEffect(() => {
  //   if (userPlanStatus && userPlan === null) {
  //     console.log("fetchedPlan in", userPlan)
  //     router.push("/price");
  //   }
  // }, [userPlan, router]);


  console.log("context payh", context.path)
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
      setLoadCircularProgress(true)
    } else {
      setRestoredPhoto(toSwitchRestoreUrl);
      setimageColorization(newPhoto[0].image);
      setimageColorizationOne(newPhoto[1].image)
      setimageColorizationTwo(newPhoto[2].image)
      setimageColorizationThree(newPhoto[3].image)
      setimageColorizationFour(newPhoto[4].image)
      setLoading(false)
      setError(null)
      setLoadCircularProgress(false)
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
      setLoadCircularProgress(true)
    } else {
      let toSwitchRestoreUrl = newPhoto;
      generateCJWBWPhoto(toSwitchRestoreUrl);
      setRestoreImageURLForVarient(newPhoto);
      setError(null)
      setLoadCircularProgress(false)
    }
    // setLoading(false);
  }

  useEffect(() => {
    if (fileUrl) {
      generateRestorePhoto(fileUrl);
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
        <title> Image Colorization | PicFix.AI </title>
        <meta name="description" content="Revive your old black and white memories with vibrant colors using our AI-powered colorization model. Transform old photographs into vivid representations of cherished moments, preserving the beauty and nostalgia of the past." />
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
      <main className='aiModels' style={{ display: 'flex', justifyContent: 'center' }} id="ClickToUp">
        <Container maxWidth='xl' >
          <Typography variant="h2" sx={{ paddingTop: '30px', fontSize: '3rem', fontWeight: '700', marginBottom: '5px', color: ' #000', lineHeight: '50px', textAlign: 'center' }} >
            Image Colorization
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: '500', color: ' #0e0e0e', textAlign: 'center' }}>
            Adding a Splash of Color to Black and White Memories
          </Typography>
          <ImageComponent setFileUrl={setFileUrl} setLoadCircularProgress={setLoadCircularProgress} loadCircularProgress={loadCircularProgress} loading={loading} setLoading={setLoading} error={error} setError={setError} fileUrl={fileUrl} restoredPhoto={restoredPhoto} setRestoredPhoto={setRestoredPhoto} imageColorization={imageColorization} restoreImageURLForVarient={restoreImageURLForVarient} imageColorizationOne={imageColorizationOne} imageColorizationTwo={imageColorizationTwo} imageColorizationThree={imageColorizationThree} imageColorizationFour={imageColorizationFour} />
        </Container>
      </main>
    </>
  )
}

export default ImageColorization;


