import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import ExplorePageContainer from '@/components/ExplorePageContainer';
import UseCaseOfModels from '@/components/ExplorePageComponents/useCases/UseCaseOfModels';
import HowItWorksComponent from '@/components/ExplorePageComponents/howItWorks/HowItWorksComponents';
import AllModelsContainer from '@/components/AllModelsContainer';
import CounterSection from '@/components/ExplorePageComponents/statistics/CounterSection';

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
    const modelName="AI Home Makeover"
    const description = 'Embrace the future of home design with our AI-powered solution. Effortlessly reimagine your interior and exterior spaces, experiencing an instant transformation that brings beauty and style to every corner of your home.'
    const routePath = '/aiHomeMakeover/runModel'
    const buttonTwoText = 'Try AI Home Makeover'
    const steps = [
        {
            id: 1,
            title: 'Select an image',
            description: 'First, click on upload button and choose photo. Your image format can be PNG or JPG.',
        },
        {
            id: 2,
            title: 'Wait for seconds',
            description: 'Our restoration model will automatically start processing your photo. This may take a few moments. Please wait while the magic happens.',
        },
        {
            id: 3,
            title: 'Download your photo',
            description: 'Your photo is ready! you have the options to re-upload another image, Download the current image, or try other models.',
        },
    ];
    const titleAndDescriptionUseCase = [
        {
          title: "Experience Instant Interior and Exterior Redesign with AI",
          description: "Effortlessly reimagine your interior and exterior spaces, enjoying an instant transformation that enhances the beauty and style of every corner of your home."
        }
      ];
      

    const useCaseData = [
        {
            id: 'interior',
            title: 'Interior Design Transformation',
            content: 'Redesign the interiors of your home with our AI model. Get personalized suggestions for furniture, colors, and decor to create your dream space.',
            button: 'Explore Interior Design',
            image: '/assets/room-design-usecase-interior.png'
        },
        {
            id: 'exterior',
            title: 'Exterior Design Overhaul',
            content: 'Revamp the exterior of your home with AI-driven design ideas. Enhance curb appeal with customized suggestions for landscaping, paint, and architectural details.',
            button: 'Explore Exterior Design',
            image: '/assets/room-design-usecase-exterior.png'
        },
        // {
        //     id: 'real estate',
        //     title: 'Boost Real Estate Value',
        //     content: 'Use AI home makeovers to increase the value of your property. Transform homes with appealing designs that attract potential buyers and renters.',
        //     button: 'Explore Real Estate Makeovers',
        //     image: 'https://via.placeholder.com/400x300?text=Real+Estate'
        // }
    ];
    

    const router = useRouter();
    return (
        <>
            <>
                <ExplorePageContainer imagesPath={imagesPath} heading={heading} description={description} buttonTwoText={buttonTwoText} routePath={routePath} />
                <HowItWorksComponent steps={steps} modelName={modelName} />
                <UseCaseOfModels useCaseData={useCaseData} titleAndDescriptionUseCase={titleAndDescriptionUseCase}/>
                <Box className="outerContent" pt={8} pb={4}>
                    <Container sx={{ minHeight: '110vh' }}>
                        <section>
                            <Container maxWidth="lg">
                                <Typography variant="h1" align="center" gutterBottom>
                                    Explore more AI tools
                                </Typography>
                                <AllModelsContainer />

                            </Container>
                        </section>
                    </Container>
                </Box>
                <CounterSection />
            </>
        </>

    )
}

export default Room