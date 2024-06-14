import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import ExplorePageContainer from '@/components/ExplorePageContainer';


function Fashion() {

    const router = useRouter();
    const beforeImageOne = '/assets/models/pexels-nathan-thomas-3019349.jpg'
    const afterImageOne = '/assets/models/gyvub-new-new.png'
    const beforeImageTwo = '/assets/models/before-fashion-two.jpg'
    const afterImageTwo = '/assets/models/after-fashion-two.png'


    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const imagesPath = [
        '/assets/models/remove-object-picfix-pic-1.png',
        '/assets/models/remove-object-picfix-pic-2.png',
    ]

    const heading= "Clean Up Your Photos with AI Object Removal"

    const description = ' Effortlessly remove unwanted objects from your photos using our advanced AI tool. Achieve a clean, professional look with just a few clicks. Perfect for creating flawless, polished images.'
    const buttonTwoText = 'Try Remove Objects'
    const routePath = '/removeObject/runModel'




    return (
        <>
            <ExplorePageContainer imagesPath={imagesPath} heading={heading} description={description} buttonTwoText={buttonTwoText} routePath={routePath} />
        </>

    )
}

export default Fashion