import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import { Explore } from '@mui/icons-material';
import ExplorePageContainer from '@/components/ExplorePageContainer';
import HowItWorksComponent from '@/components/ExplorePageComponents/howItWorks/HowItWorksComponents';
import UseCaseOfModels from '@/components/ExplorePageComponents/useCases/UseCaseOfModels';
import AllModelsContainer from '@/components/AllModelsContainer';
import CounterSection from '@/components/ExplorePageComponents/statistics/CounterSection';


function Colorization() {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const imagesPath = [
        '/assets/hedy lamar image-colorization-1600X900 .jpg',
        '/assets/Gene Kelly 1600X900 image colorization.jpg',
    ]

    const heading = 'Add Vibrant Colors to Your Old Memories with AI.'
    const modelName="Image Colorization"
    const description = 'Revive your old black and white memories with vibrant colors using our AI-powered colorization model. Transform old photographs into vivid representations of cherished moments, preserving the beauty and nostalgia of the past.'
    const routePath = '/imageColorization/runModel'
    const buttonTwoText = 'Try Image Colorization'

    const router = useRouter();
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
          title: "Infuse Your Old Memories with Vibrant Colors Using AI",
          description: "Bring your black and white photos to life with our AI-powered colorization model. Turn old photographs into vibrant, colorful depictions of cherished moments, preserving the beauty and nostalgia of the past."
        }
      ];
      

    const useCaseData = [
        {
            id: 'family',
            title: 'Revive Family Memories',
            content: 'Bring old family photos to life by adding color. Preserve and share your heritage with vibrant and realistic colorized images.',
            button: 'Explore Family Memories',
            image: '/assets/Image-colorization--usecase-family.png'
        },
        // {
        //     id: 'history',
        //     title: 'Historical Preservation',
        //     content: 'Colorize historical photos to gain a new perspective on the past. Enhance the educational value and engagement of historical archives and presentations.',
        //     button: 'Explore Historical Preservation',
        //     image: 'https://via.placeholder.com/400x300?text=Historical+Preservation'
        // },
        {
            id: 'media',
            title: 'Media Restoration',
            content: 'Update black and white photos for use in modern media projects. Perfect for documentaries, news articles, and digital media content.',
            button: 'Explore Media Restoration',
            image: '/assets/Image-colorization--usecase-1.png'
        },
    ];


    return (
        <>
            <ExplorePageContainer imagesPath={imagesPath} heading={heading} description={description} buttonTwoText={buttonTwoText} routePath={routePath} />
            <HowItWorksComponent steps={steps} modelName={modelName} />
            <UseCaseOfModels useCaseData={useCaseData} titleAndDescriptionUseCase={titleAndDescriptionUseCase} />
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

    )
}

export default Colorization