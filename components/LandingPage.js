import styles from './../styles/Home.module.css'
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { Container, Icon } from '@mui/material';
import AllModelsContainer from './AllModelsContainer';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import ReactCompareImage from 'react-compare-image';
import { useEffect } from 'react';
import { useState } from 'react';
import { Typewriter } from 'react-simple-typewriter'
import Image from 'next/image';
import Head from 'next/head';



function LandingPage() {
  // const [matchesToSetMediaQuery, setMatchesToSetMediaQuery] = useState(null)

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  // console.log("matches", matches)
  const router = useRouter();

  // useEffect(() => {
  //   setMatchesToSetMediaQuery(matches)
  // }, [])

  const handleClickOpen = () => {
    router.push('#All-AI-Models');
    localStorage.setItem('path','/#All-AI-Models')
  };
  const images = ['/assets/image Colorization landing page  1600X900.jpg', '/assets/remove-background-banner.jpg', '/assets/restore photo landing page  1600X900.jpg'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Logic to update the current image index
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, []);
  const words = ['Introducing One-Click Photo Editing & Beyond using AI']


  // if (!matchesToSetMediaQuery) {
  //   return null
  // }

  return (
    <>
      <Head>
        <link rel="preload" href="/assets/banner-new.jpg" as="image" />
      </Head>
      <div className={styles.landingPage}>
        <div className={styles.landingPageImage}>

          <div className={styles.carouselOne}>
            <div style={{ display: 'flex', width: '100vw', height: '60%' }}>

              <div className={styles.landingPageContent} style={{ marginTop: matches ? '22.5vh' : '5em' }}>
                <h1>Introducing One-Click <br />  Photo Editing  & Beyond  <br />  </h1><span className={styles.gradientColor}>   <h1>   
                  <Typewriter loop={false}
                  words={['using AI ', 'with Picfix']} />  </h1>  </span>
                <p>Transform your blurry, low-resolution images into stunning works of art with AI. Our advanced AI-powered algorithm takes care of everything from removing noise to enhancing sharpness and restoring lost details, all with just one click.</p>
                {
                  !matches &&
                  <div className={styles.animatedImageContainer}>
                    <Image priority={true} src={images[currentImageIndex]} alt="Girl blur image " width={1600} height={900} />
                  </div>
                }
                <button onClick={handleClickOpen}>Try Now</button>
              </div>
              {
                matches &&
                <div className={styles.compareSliderContainer}>
                  <div className={styles.animatedImageContainer}>
                    <Image priority={true} src={images[currentImageIndex]} alt="Girl blur image " width={1600} height={900} />
                  </div>
                </div>
              }
            </div>
          </div>


        </div>



      </div>
      <div id='All-AI-Models' className={styles.blankSpace}>

      </div>

      <div className='allModelCards'>
        <AllModelsContainer />
      </div>

    </>
  )
}

export default LandingPage