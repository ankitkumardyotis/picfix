import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'


function colorization() {
    const router = useRouter();
    const beforeImageOne = '/assets/restore-photo-before.jpg'
    const afterImageOne = '/assets/after-image-colorization.jpg'
    const beforeImageTwo = '/assets/Hedy Lamarr old pic.png'
    const afterImageTwo = '/assets/Hedy Lamarr High Resolution pic.png'

    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));


    return (
        <Box sx={{ background: 'linear-gradient(59deg, rgba(100, 214, 207, 1) 0%, rgba(242, 212, 159, 1) 100%)', }}>
            <Container maxWidth='lg' sx={{ display: 'flex', flexDirection: matches ? 'row' : 'column', justifyContent: 'space-evenly', alignItems: 'center', height: '100vh' }}>
                <Box sx={{ display: 'flex', minHeight: matches ? '55vh' : '', marginTop: matches ? '-20px' : '60px' }}>
                <Box className="modelInformation" style={{
                        width: matches ? '50vw' : '100%', display: 'flex', flexDirection: 'column', gap: '15px'
                    }}>
                        <Typography variant="h1"> Adding Color to Black and White Memories  <br />
                            <span style={{ color: 'teal', margin: '5px' }}>using AI
                            </span>
                            for everyone.
                        </Typography>
                        <Typography varient="p">Experience the magic of AI as we bring your old face photos back to life. <br />Our advanced AI technology will colorize those cherished memories.</Typography>
                        <div className="buttons" style={{ gap: '30px', marginTop: '30px' }}>
                            <button style={{ marginRight: '30px' }} className="button">How it works</button>
                            <button className="button" onClick={() => { router.push('/AIModels/imageColorization') }}>Colorization</button>
                        </div>
                    </Box>
                </Box>
                <Box className='box-container' sx={{ padding: '10px' ,marginTop:'30px'}}>
                    <CarouselSlider beforeImageOne={beforeImageOne} afterImageOne={afterImageOne} beforeImageTwo={beforeImageTwo} afterImageTwo={afterImageTwo} />
                </Box>
            </Container>
        </Box>

    )
}

export default colorization