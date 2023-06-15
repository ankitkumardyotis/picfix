import styles from './LandingPage.module.css'
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { Icon } from '@mui/material';
import AllModelsContainer from '../AllModelsContainer';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';


function LandingPage({ setOpen, open }) {

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  const router = useRouter();

  const handleClickOpen = () => {
    // setOpen(true);
    router.push('#allModelContainer');

  };
  return (
    <>
      <div className={styles.landingPage}>
        {
          matches &&
          <div className={styles.landingPageImage}>
            <Carousel
              showArrows={true}
              autoPlay={true}
              infiniteLoop={true}
              // interval={10000}
              showThumbs={false}
              // preventMovementUntilSwipeScrollTolerance={true}
              transitionTime={1000}
              showStatus={false}
              stopOnHover={true}
            >
              <div className={styles.carouselOne}>
                <div className={styles.landingPageContent}>
                  <h1>Introducing One-Click <br />   Image Restoration <br /> with AI</h1>
                  <p>Transform your blurry, low-resolution images into stunning works of art with AI. Our advanced AI-powered algorithm takes care of everything - from removing noise to enhancing sharpness and restoring lost details - all with just one click</p>
                  <button onClick={handleClickOpen}>Try Now <Icon fontSize='small'><ArrowOutwardIcon /></Icon></button>
                </div>
                <div className={styles.compareSliderContainer}>
                  <ReactCompareSlider
                    changePositionOnHover={false}
                    className={styles.reactCompareSlider}
                    itemOne={<>
                      <ReactCompareSliderImage src={'/assets/girlBluredImage.jpeg'} alt="Image one" />
                    </>} itemTwo={<ReactCompareSliderImage src={'/assets/girlImg.jpg'} alt="Image two" />} />
                </div>
              </div>
              <div className={styles.carouselTwo}>
                <div className={styles.landingPageContent}>
                  <h1>Eliminate Motion Blur <br /> with AI in just one Click </h1>
                  <p>Our state-of-the-art image restoration algorithm is specifically designed to eliminate motion blur and give you crisp, clear images every time.
                    Restore your images to their full potential and eliminate any motion blur.<br /><br /><br /></p>
                  <button onClick={handleClickOpen}>Try Now<Icon fontSize='small'><ArrowOutwardIcon /></Icon>  </button>
                </div>
                <div className={styles.compareSliderContainer}>
                  <ReactCompareSlider
                    className={styles.reactCompareSlider}
                    changePositionOnHover={false}
                    itemOne={<ReactCompareSliderImage src={'/assets/blurry-roads.jpg'} alt="Image Before" />} itemTwo={<ReactCompareSliderImage src={'/assets/RestoredMotionBlurImage.jpg'} alt="Image after" />} />
                </div>
              </div>

            </Carousel >
          </div>
        }


      </div>
      <div className={styles.heroSection}>
        <div className={styles.info}>
          <h1>Introducing One-Click Image Restoration <br /> with AI</h1>
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
      <div id='allModelContainer' className='allModelCards'>
        <AllModelsContainer />
      </div>
    </>
  )
}

export default LandingPage