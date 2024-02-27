import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import ExplorePageContainer from '@/components/ExplorePageContainer';

function BackGroundRemove() {
    const router = useRouter();
    const beforeImageOne = '/assets/models/before_Remove_bg_4x5.jpeg'
    const afterImageOne = '/assets/models/after_Remove_bg_4x5.png'
    const beforeImageTwo = '/assets/models/pexels-nathan-thomas-3019349.jpg'
    const afterImageTwo = '/assets/models/pexels-nathan-thomas-rmbg.jpg.png'

    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const imagesPath = [
        '/assets/remove-background-banner (1).jpg',
        '/assets/background removal 1600X900 girl .jpg',
        '/assets/models/background removal 1600X900 boy.jpg',
    ]

    const heading = 'Background Removal made simple using AI'

    const description = 'Effortlessly remove backgrounds from any image using our AI-powered model. Transform your photos instantly, allowing you to focus on the subject and create captivating visuals.'
    const routePath = '/backgroundRemoval/runModel'
    const buttonTwoText = 'Try Background Removal'



    return (
        <>
            <ExplorePageContainer imagesPath={imagesPath} heading={heading} description={description} buttonTwoText={buttonTwoText} routePath={routePath} />
        </>

    )
}

export default BackGroundRemove