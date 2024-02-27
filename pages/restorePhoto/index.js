import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import ExplorePageContainer from '@/components/ExplorePageContainer';

function Restore() {
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const imagesPath = [
        '/assets/girl camparison with blur and deblur 1600 X 900.jpg',
        '/assets/old pic child  restore photo 1600X900.jpg',
    ]

    const heading = 'Restoring old photos with the power of AI'

    const description = 'Do you have old, blurry photos of people? Our advanced AI technology can bring them back to life, ensuring your precious memories are preserved. Rediscover the beauty and vibrancy of your photos by restoring them today!'
    const routePath = '/restorePhoto/runModel'
    const buttonTwoText = 'Try Restore Photo'

    const router = useRouter();



    return (
        <>
            <ExplorePageContainer imagesPath={imagesPath} heading={heading} description={description} buttonTwoText={buttonTwoText} routePath={routePath} />
        </>

    )
}

export default Restore