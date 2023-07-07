import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'

function fashion() {
    const router = useRouter();
    const beforeImageOne = '/assets/models/before_Remove_bg_4x5.jpeg'
    const afterImageOne = '/assets/models/after_Remove_bg_4x5.png'
    const beforeImageTwo = '/assets/models/pexels-nathan-thomas-3019349.jpg'
    const afterImageTwo = '/assets/models/pexels-nathan-thomas-rmbg.jpg.png'
    
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Box sx={{ background: 'linear-gradient(59deg, rgba(100, 214, 207, 1) 0%, rgba(242, 212, 159, 1) 100%)', }}>
            <Container maxWidth='lg' sx={{ display: 'flex', flexDirection: matches ? 'row' : 'column', justifyContent: 'space-evenly', alignItems: 'center', height: '100vh' }}>
                <Box sx={{ display: 'flex', minHeight: matches ? '55vh' : '', marginTop: matches ? '-20px' : '30px' }}>
                    <Box className="modelInformation" style={{
                        width: matches ? '50vw' : '100%', display: 'flex', flexDirection: 'column', gap: '20px'
                    }}>
                        <Typography variant="h1">Remove Background  <br />
                            <span style={{ color: 'teal', margin: '5px' }}>using AI
                            </span>
                            from any images.
                        </Typography>
                        <Typography varient="p">Need to remove background from image? Let our AI remove them <br /> so those memories can live on. 100% free – restore your photos today.</Typography>
                        <div className="buttons" style={{ gap: '30px', marginTop: '30px' }}>
                            <button style={{ marginRight: '30px' }} className="button">How it works</button>
                            <button className="button" onClick={() => { router.push('/AIModels/removeBackground') }}>Remove Background</button>
                        </div>
                    </Box>
                </Box>
                <Box className='box-container' sx={{padding:'10px',minWidth:'40%'}}>
                    <CarouselSlider beforeImageOne={beforeImageOne} afterImageOne={afterImageOne} beforeImageTwo={beforeImageTwo} afterImageTwo={afterImageTwo} />
                </Box>
            </Container>
        </Box>

    )
}

export default fashion