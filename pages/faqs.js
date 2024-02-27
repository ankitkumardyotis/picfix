import { Box, Container, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Link from 'next/link';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


function Faqs() {



    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Container maxWidth='sm' sx={{ marginTop: '5em', minHeight: '100vh' }}>
            <Typography variant='h4' sx={{ textAlign: 'center', fontWeight: 'bold', mb: 5 }}>
                FAQ
            </Typography>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>What is Picfix.ai?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Picfix.ai is a revolutionary online platform that utilizes advanced AI models to enhance and transform your photos with just one click. Our AI-powered algorithms can improve image quality, restore old photos, add vibrant colors, remove backgrounds, and even transform your appearance and home design.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography>How does Picfix.ai work?</Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Typography>
                        Picfix leverages the power of AI models to analyze and modify your images. By simply uploading your photo to our platform, our AI algorithms work their magic to enhance, restore, colorize, remove backgrounds, or make other transformations, resulting in stunning images.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography>What will happen to my photos?</Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Typography >
                        When you upload your photos to Picfix.ai, they are securely processed by our AI models to perform the desired enhancements or transformations. The photos are used solely for the purpose of generating the modified versions and are not shared or used for any other purposes without your consent.
                        <br /><br />
                        We prioritize user privacy and ensure that your photos are treated with the utmost care. We do not retain your photos on our servers beyond the necessary processing time. Once the modifications are generated, you can download the enhanced versions of your photos, and the original images are removed from our system. we do not store them beyond 30 minutes after the job is done. After this period, all images are permanently deleted from our servers.
                        <br />
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography>Do I need any technical skills to use Picfix.ai?</Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Typography>
                        Not at all! Picfix.ai is designed to be user-friendly and requires no technical expertise. Our one-click solution makes it easy for anyone to transform their photos with AI.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography>Which file format should i use?</Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Typography>
                        Picfix.ai supports commonly used image file formats, such as JPEG, JPG and PNG.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography>What are the benefits of using Picfix.ai? </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Typography>
                    Picfix.ai provides seamless photo enhancement using advanced AI technology. You can restore old and blurred photos, add vibrant colors to black and white memories, easily remove backgrounds, modify the appearance of clothes, and visualize a home makeover. With a user-friendly interface, Picfix.ai allows you to transform your photos with just one click, preserve precious memories, and unleash your creativity. Picfix.ai versatility caters to both personal and professional use, making it a valuable tool for individuals and businesses. Experience the power of AI to enhance your photos and turn them into stunning works of art.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography>Can I use Picfix.ai for commercial purposes?</Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Typography>
                        Yes, you can use the enhanced photos generated by Picfix.ai for both personal and commercial purposes.
                    </Typography>
                </AccordionDetails>
            </Accordion><br /><br /><br /><br />
        </Container >
    )
}

export default Faqs

