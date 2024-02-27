import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import ExplorePageContainer from '@/components/ExplorePageContainer';


function ReplaceBackground() {

    const router = useRouter();
    const beforeImageOne = '/assets/models/pexels-nathan-thomas-3019349.jpg'
    const afterImageOne = '/assets/models/gyvub-new-new.png'
    const beforeImageTwo = '/assets/models/before-fashion-two.jpg'
    const afterImageTwo = '/assets/models/after-fashion-two.png'


    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const imagesPath = [
        '/assets/models/girl with diffrent color by trendy look ai.jpg',
        '/assets/models/trendy look 1600X900 boy.jpg',
    ]

    const heading = ' Redesign Your Look with AI-Powered Replace Background '

    const description = ' Transform your social media presence with our AI-generated fashion enhancements. Embrace the AI generated trends and captivate your followers with striking and personalized style modifications.'
    const buttonTwoText = 'Try Replace Background'
    const routePath = '/replaceBackground/runModel'




    return (
        <>
            <ExplorePageContainer imagesPath={imagesPath} heading={heading} description={description} buttonTwoText={buttonTwoText} routePath={routePath} />

        </>

    )
}

export default ReplaceBackground