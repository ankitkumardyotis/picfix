import styles from './LandingPage.module.css'
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { Container, Icon } from '@mui/material';
import AllModelsContainer from '../AllModelsContainer';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import ReactCompareImage from 'react-compare-image';
import { useEffect } from 'react';
import { useState } from 'react';


function LandingPage() {

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  const router = useRouter();

  const handleClickOpen = () => {
    router.push('#All-AI-Models');

  };
  const images = ['/assets/Image Colorization.jpg', '/assets/remove-background-banner.jpg', '/assets/A image of girl compare by blur and deblur.png'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Logic to update the current image index
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, []);


  return (
    <>

      <div className={styles.landingPage}>
        {
          matches &&
          <div className={styles.landingPageImage}>

            <div className={styles.carouselOne}>
              <div className={styles.landingPageContent}>
                <h1>Introducing One-Click <br />  Photo Editing  & Beyond  <br />  </h1><span className={styles.gradientColor}>   <h1>using AI  </h1>  </span>
                <p>Transform your blurry, low-resolution images into stunning works of art with AI. Our advanced AI-powered algorithm takes care of everything - from removing noise to enhancing sharpness and restoring lost details - all with just one click</p>
                <button onClick={handleClickOpen}>Try Now <Icon fontSize='small'><ArrowOutwardIcon /></Icon></button>
              </div>
              <div className={styles.compareSliderContainer}>
                <div className={styles.animatedImageContainer}>
                  <img src={images[currentImageIndex]} alt="Girl blur image " />
                </div>
              </div>
            </div>

          </div>
        }


      </div>
      <div className={styles.heroSection}>
        <div className={styles.info}>
          <h1 >Introducing One Click <br />  Photo Editing   <br /> <span className={styles.gradientColor}>  using AI  </span> </h1>
          <p>Transform your blurry, low-resolution images into stunning works of art with AI. Our advanced AI-powered algorithm takes care of everything - from removing noise to enhancing sharpness and restoring lost details - all with just one click</p>
        </div>
        <div className={styles.compareSliderContainerInMobile}>
          <ReactCompareSlider
            className={styles.reactCompareSliderInMobile}
            changePositionOnHover={false}
            itemOne={<ReactCompareSliderImage src={'/assets/girlWithoutblur.jpg'} alt="Image Before" />} itemTwo={<ReactCompareSliderImage src={'/assets/girlWithBlur.jpeg'} alt="Image after" />} />
        </div>
        <div className={styles.mobileViewButton}>
          <button onClick={handleClickOpen}>Try Now<Icon fontSize='small'><ArrowOutwardIcon /></Icon>  </button>

        </div>
      </div>
      <div id='All-AI-Models'  className={styles.blankSpace}>
        
      </div>

        <div className='allModelCards'>
          <AllModelsContainer />
        </div>

    </>
  )
}

export default LandingPage