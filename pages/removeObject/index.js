import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import ExplorePageContainer from '@/components/ExplorePageContainer';
import HowItWorksComponent from '@/components/ExplorePageComponents/howItWorks/HowItWorksComponents';
import UseCaseOfModels from '@/components/ExplorePageComponents/useCases/UseCaseOfModels';
import CounterSection from '@/components/ExplorePageComponents/statistics/CounterSection';
import AllModelsContainer from '@/components/AllModelsContainer';
import FAQ from '@/components/faqComponent/Faq';
import { removeObjectFaqContent } from '@/data/FaqData';
import Seo from '@/components/seo/Seo';


function Fashion() {

    const router = useRouter();
    // const beforeImageOne = '/assets/models/pexels-nathan-thomas-3019349.jpg'
    // const afterImageOne = '/assets/models/gyvub-new-new.png'
    // const beforeImageTwo = '/assets/models/before-fashion-two.jpg'
    // const afterImageTwo = '/assets/models/after-fashion-two.png'


    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const modelName = "Remove Object"

    const imagesPath = [
        '/assets/models/remove-object-picfix-pic-1.png',
        '/assets/models/remove-object-picfix-pic-2.png',
    ]

    const heading = "Clean Up Your Photos with AI Object Removal"

    const description = ' Effortlessly remove unwanted objects from your photos using our advanced AI tool. Achieve a clean, professional look with just a few clicks. Perfect for creating flawless, polished images.'
    const buttonTwoText = 'Try Remove Objects'
    const routePath = '/removeObject/runModel'

    const steps = [
        {
            id: 1,
            title: 'Select an image',
            description: 'First, click on upload button and choose photo. Your image format can be PNG or JPG.',
        },
        {
            id: 2,
            title: 'Mask image to remove Objects',
            description: 'Create a mask of image by draging on image and click remove object Our restoration model will start processing your photo. Please wait while the magic happens.',
        },
        {
            id: 3,
            title: 'Download your photo',
            description: 'Your photo is ready! you have the options to re-upload another image, Download the current image, or try other models.',
        },
    ];
    const titleAndDescriptionUseCase = [
        {
            title: "Achieve Perfection with AI Object Removal",
            description: "Easily eliminate unwanted objects from your photos using our cutting-edge AI tool. Create clean, professional images with just a few clicks—ideal for achieving flawless, polished results."
        }
    ];

    const useCaseData = [
        {
            id: 'Remove Objects',
            title: 'Perfect Your Photos',
            content: 'Easily remove unwanted objects from your photos to create the perfect shot. Enhance the focus on your subject and clean up distracting elements.',
            button: 'Explore Photography Enhancements',
            // image: '/assets/remove-object-picfix-usecase.gif'
            image: '/assets/remove-object-picfix-usecase-1.gif'
        },
        // {
        //     id: 'Social',
        //     title: 'Optimize Marketing Materials',
        //     content: 'Remove objects from marketing images to highlight key products or messages. Create clean and compelling visuals for advertisements, brochures, and online campaigns.',
        //     button: 'Explore Marketing Solutions',
        //     image: '/assets/remove-object-picfix-usecase-1.gif'
        // }
    ];



    return (
        <>
            <Seo
                title="Remove Object from Image - AI Powered Object Remover | Picfix.ai"
                description="Easily remove unwanted objects from your photos with Picfix.ai. Upload your image, create a mask over the object, and let our AI tool erase it seamlessly."
                url="https://www.picfix.ai/removeObject"
                keywords="remove objects from photos, erase people from photos, remove unwanted objects from photos, delete object from photo, remove objects from pictures, free remove background from image, erase object from photo, remove object picture, photo background erase, eliminate background from image, delete background free, background remover, background changer, edit photo background, delete background from photo, background photo editing online, object removal tool, erase unwanted objects from photo"
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
            <FAQ faqContent={removeObjectFaqContent} />
            {/* <CounterSection /> */}
        </>

    )
}

export default Fashion