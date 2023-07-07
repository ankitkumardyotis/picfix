import CarouselSlider from '@/components/carouselSlider'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Container, Typography } from '@mui/material'
import React from 'react'

function modelDetails() {
    return (
        <Box sx={{ background: 'linear-gradient(59deg, rgba(100, 214, 207, 1) 0%, rgba(242, 212, 159, 1) 100%)', }}>
            <Container maxWidth='lg' sx={{  display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', height: '100vh' }}>
                <Box sx={{ display: 'flex',minHeight:'55vh' }}>
                    <Box className="modelInformation" style={{ width: '50vw',display:'flex',flexDirection:'column',gap:'20px' }}>
                        <Typography variant="h1">Restoring old photos  <br />
                            <span style={{ color: 'teal', margin: '5px' }}>using AI
                            </span>
                            for everyone.
                        </Typography>
                        <Typography varient="p">Have old and blurry face photos? Let our AI restore them <br /> so those memories can live on. 100% free – restore your photos today.</Typography>
                        <div className="buttons" style={{  gap: '30px',marginTop:'30px' }}>
                            <button style={{marginRight:'30px' }} className="button">Discover its function</button>
                            <button className="button">Restore your photos</button>
                        </div>
                    </Box>
                </Box>
                <Box>

                    <CarouselSlider />

                </Box>
            </Container>
        </Box>

    )
}

export default modelDetails