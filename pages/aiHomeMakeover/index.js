import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import ExplorePageContainer from '@/components/ExplorePageContainer';

function Room() {

    const beforeImageOne = '/assets/before-room-1.jpg'
    const afterImageOne = '/assets/after-room-1.png'
    const beforeImageTwo = '/assets/before-room-2.jpg'
    const afterImageTwo = '/assets/after-room-2.png'

    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const imagesPath = [
        '/assets/Design Room AI Model 1600X900.jpg',
        '/assets/Design interior Room include chair with AI Model 1600X900.jpg',
        '/assets/Design interior Room with AI Model 1600X900.jpg',
      
    ]

    const heading = 'AI Home Makeover Instantly Redesign your Interior and Exterior'

    const description = 'Embrace the future of home design with our AI-powered solution. Effortlessly reimagine your interior and exterior spaces, experiencing an instant transformation that brings beauty and style to every corner of your home.'
    const routePath = '/aiHomeMakeover/runModel'
    const buttonTwoText = 'Try AI Home Makeover'


    const router = useRouter();
    return (
        <>
            <>
                <ExplorePageContainer imagesPath={imagesPath} heading={heading} description={description} buttonTwoText={buttonTwoText} routePath={routePath} />
            </>
        </>

    )
}

export default Room