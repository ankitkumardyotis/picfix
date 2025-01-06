import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import ExplorePageContainer from '@/components/ExplorePageContainer';
import HowItWorksComponent from '@/components/ExplorePageComponents/howItWorks/HowItWorksComponents';
import UseCaseOfModels from '@/components/ExplorePageComponents/useCases/UseCaseOfModels';
import AllModelsContainer from '@/components/AllModelsContainer';
import CounterSection from '@/components/ExplorePageComponents/statistics/CounterSection';
import FAQ from '@/components/faqComponent/Faq';
import { removeBackgroundFaqContent } from '@/data/FaqData';
import Seo from '@/components/seo/Seo';

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
    const modelName = 'Remove Background'

    const description = 'Effortlessly remove backgrounds from any image using our AI-powered model. Transform your photos instantly, allowing you to focus on the subject and create captivating visuals.'
    const routePath = '/backgroundRemoval/runModel'
    const buttonTwoText = 'Try Background Removal'

    const steps = [
        {
            id: 1,
            title: 'Select an image',
            description: 'First, click on upload button and choose photo. Your image format can be PNG or JPG.',
        },
        {
            id: 2,
            title: 'Wait for seconds',
            description: 'Our Background Removal model will automatically start processing your photo. This may take a few moments. Please wait while the magic happens.',
        },
        {
            id: 3,
            title: 'Download your photo',
            description: 'Your photo is ready! you have the options to re-upload another image, Download the current image, or try other models.',
        },
    ];
    const titleAndDescriptionUseCase = [
        {
            title: "Simplify Background Removal with AI",
            description: "Effortlessly eliminate backgrounds from any image using our AI-powered model. Instantly transform your photos, allowing you to highlight the subject and create stunning visuals."
        }
    ];



    const useCaseData = [
        // {
        //     id: 'graphic design',
        //     title: 'Create Stunning Designs',
        //     content: 'Easily remove backgrounds to create stunning graphic designs. Perfect for posters, flyers, and marketing materials.',
        //     button: 'Explore Graphic Design',
        //     image: 'https://via.placeholder.com/400x300?text=Graphic+Design'
        // },
        {
            id: 'photography',
            title: 'Perfect Your Shots',
            content: 'Easily remove distracting backgrounds from photos to highlight the main subject. Ideal for professional photographers and hobbyists alike.',
            button: 'Explore Photography',
            image: '/assets/removebg-social-media-usecase.png'
        },
        {
            id: 'e-commerce',
            title: 'Professional Product Listings',
            content: 'Remove backgrounds from product images to create professional and consistent listings. Increase the visual appeal and make your products stand out.',
            button: 'Explore E-commerce',
            image: '/assets/removebg-social-media-usecase-ecommerce.png'
        },
    ];


    return (
        <>
            <Seo
                title="Remove Background from Image Online – Picfix.ai"
                description="Remove the background from any image effortlessly using Picfix.ai's AI-powered background remover. Upload an image and get a clear, background in seconds."
                url="https://www.picfix.ai/backgroundRemoval"
                keywords="remove background from image, AI background remover, delete image background, background remover online, clear picture background, remove bg, image background remover, remove background online free."
            />
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
            <FAQ faqContent={removeBackgroundFaqContent} />
            {/* <CounterSection /> */}

        </>

    )
}

export default BackGroundRemove