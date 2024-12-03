import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useTheme } from '@mui/material';
import React from 'react';
import ExplorePageContainer from '@/components/ExplorePageContainer';
import HowItWorksComponent from '@/components/ExplorePageComponents/howItWorks/HowItWorksComponents';
import UseCaseOfModels from '@/components/ExplorePageComponents/useCases/UseCaseOfModels';
import AllModelsContainer from '@/components/AllModelsContainer';
import CounterSection from '@/components/ExplorePageComponents/statistics/CounterSection';
import Faq from "@/components/faqComponent/Faq";
import { restorePhotoFaqContent } from "@/data/FaqData";
import Seo from "@/components/seo/Seo";
function Restore() {
    const imagesPath = [
        '/assets/girl camparison with blur and deblur 1600 X 900.jpg',
        '/assets/old pic child  restore photo 1600X900.jpg',
    ];

    const heading = 'Restoring old photos with the power of AI';
    const modelName = 'Restore Photo'
    const description = 'Do you have old, blurry photos of people? Our advanced AI technology can bring them back to life, ensuring your precious memories are preserved. Rediscover the beauty and vibrancy of your photos by restoring them today!';
    const routePath = '/restorePhoto/runModel';
    const buttonTwoText = 'Try Restore Photo';
    const titleAndDescriptionUseCase = [
        {
            title: "Revitalize Your Old Photos with AI Technology",
            description: "Have old, blurry photos of loved ones? Our advanced AI can rejuvenate them, preserving your precious memories. Restore the beauty and vibrancy of your photos today!"
        }
    ];


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

    const useCaseData = [
        // {
        //     id: 'photography',
        //     title: 'Capture the Moment',
        //     content: 'Restore and enhance old or damaged photos. Make pictures clearer and more colorful, preserving precious memories for the future.',
        //     button: 'Explore Photography',
        //     image: 'https://via.placeholder.com/400x300?text=Photography'
        // },
        {
            id: 'e-commerce',
            title: 'Enhancing Product Images',
            content: 'Improve product photos to attract more customers and boost sales. Enhance clarity and appeal to create a better shopping experience online.',
            button: 'Explore E-commerce',
            image: '/assets/Restore-photo-ecommerce-image.png'

        },
        {
            id: 'socialmedia',
            title: 'Grow Your Audience',
            content: 'Restore and enhance social media photos to create eye-catching posts. Engage followers with memorable visuals that stand out on social platforms.',
            button: 'Explore Social Media Growth',
            // image: 'https://via.placeholder.com/400x300?text=Social+Media'
            image: '/assets/SocialUseCaseCompareImageRestorePhoto-1.png'
        }
    ];



    return (
        <>
            <Seo
                title="Restore Photo – Enhance & Restore Your Photos | Picfix.ai"
                description=" Enhance the quality of your low-resolution or old photos with picfix.ai's AI photo enhancer. Upload your images and restore their clarity and resolution online."
                url="https://www.picfix.ai/restorePhoto"
                keywords="ai photo enhancer, photo enhancer, photo enhancer ai, enhance picture, enhancer image, restore old photos, restore old pictures, photo ai, ai photos, image high resolution, picture enhancer online free, photo download, image enhancer free, enhance photo online, restore old images"
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
            <Faq faqContent={restorePhotoFaqContent} />
            {/* <CounterSection /> */}

        </>
    );
}

export default Restore;
