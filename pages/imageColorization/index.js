import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import { Explore } from '@mui/icons-material';
import ExplorePageContainer from '@/components/ExplorePageContainer';


function Colorization() {
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const imagesPath = [
        '/assets/hedy lamar image-colorization-1600X900 .jpg',
        '/assets/Gene Kelly 1600X900 image colorization.jpg',
    ]

    const heading = 'Add Vibrant Colors to Your Old Memories with AI.'

    const description = 'Revive your old black and white memories with vibrant colors using our AI-powered colorization model. Transform old photographs into vivid representations of cherished moments, preserving the beauty and nostalgia of the past.'
    const routePath = '/imageColorization/runModel'
    const buttonTwoText = 'Try Image Colorization'

    const router = useRouter();

    return (
        <>
            <ExplorePageContainer imagesPath={imagesPath} heading={heading} description={description} buttonTwoText={buttonTwoText} routePath={routePath} />
        </>

    )
}

export default Colorization