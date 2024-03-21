import { Container, Grid, ListItem, Typography } from '@mui/material'
import React from 'react'
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Link from 'next/link';
import { Router, useRouter } from 'next/router';
import { useContext } from 'react';
import AppContext from './AppContext';

function Footer() {
    const context = useContext(AppContext);
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const buttonSX = {
        '&:hover': {
            marginLeft: '5px',
            transition: 'all 0.3s ease-in-out',
        }

    };
    const router = useRouter();
    const date = new Date();
    const currentYear = date.getFullYear();

    return (

        <Grid container spacing={2} sx={{ bgcolor: '#F5F5F5', py: 5, px: matches ? 3 : 2.2, pb: !matches && 10 }} >
            <Grid item xs={12} md={6} lg={3} >
                <Box className='footerLogo' onClick={() => { router.push('/'), context.setFileUrl('') }} >
                    <Image src="/assets/PicFixAILogo.jpg" alt="logo" width={200} height={40} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', gap: '20px', mt: 2, mr: 5 }}>
                    <Typography variant='p' sx={{ lineHeight: '1.1em', fontSize: '1.3em' }}>
                        Introducing One-Click  Photo Editing & Beyond
                        using AI
                    </Typography>
                    {
                        matches &&
                        <Typography variant='p'>
                            &#169; Copyright {currentYear} All Rights Reserved by <Link target='_blank' style={{ textDecoration: 'none' }} href={'https://dyotis.com/'}>Dyotis Analytics PVT. LTD.</Link>
                        </Typography>
                    }
                </Box>
            </Grid>

            <Grid item xs={6} md={6} lg={3} >
                <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
                    AI-Models
                </Typography>
                <Box sx={buttonSX} onClick={() => { router.push('/restorePhoto'), context.setFileUrl("") }} >
                    <Typography variant="body2" sx={{ mb: 3, fontSize: '1em', color: 'rgb(87 83 78)', cursor: 'pointer' }}>
                        Restore Photos
                    </Typography>
                </Box>
                <Box sx={buttonSX} onClick={() => { router.push('/imageColorization'), context.setFileUrl("") }} >
                    <Typography variant="body2" sx={{ mb: 3, fontSize: '1em', color: 'rgb(87 83 78)', cursor: 'pointer' }}>
                        Image Colorization
                    </Typography>
                </Box>
                <Box sx={buttonSX} onClick={() => { router.push('/backgroundRemoval'), context.setFileUrl("") }} >
                    <Typography variant="body2" sx={{ mb: 3, fontSize: '1em', color: 'rgb(87 83 78)', cursor: 'pointer' }}>
                        Background Removal
                    </Typography>
                </Box>
                <Box sx={buttonSX} onClick={() => { router.push('/trendyLook'), context.setFileUrl("") }} >

                    <Typography variant="body2" sx={{ mb: 3, fontSize: '1em', color: 'rgb(87 83 78)', cursor: 'pointer' }}>
                        Trendy Look
                    </Typography>
                </Box>
                <Box sx={buttonSX} onClick={() => { router.push('/aiHomeMakeover'), context.setFileUrl("") }} >

                    <Typography variant="body2" sx={{ mb: 3, fontSize: '1em', color: 'rgb(87 83 78)', cursor: 'pointer' }}>
                        AI Home Makeover
                    </Typography>
                </Box>

            </Grid>
            <Grid item xs={6} md={6} lg={3} >
                <Typography variant="h6" component="div" sx={{ ml: matches ? '' : 3, mb: 2, fontWeight: 'bold' }}>
                    Legal
                </Typography>
                {/* <Typography variant="body2" sx={{ ml: matches ? '' : 3, mb: 3, fontSize: '1em', color: 'rgb(87 83 78)' }}>
                    Refund Policy
                </Typography> */}
                {/* <Typography variant="body2" sx={{ ml: matches ? '' : 3, mb: 3, fontSize: '1em', color: 'rgb(87 83 78)' }}>
                    Contact Us
                </Typography> */}
                <Box sx={buttonSX} onClick={() => { router.push('/privacy'); }} >
                    <Typography variant="body2" sx={{ ml: matches ? '' : 3, mb: 3, fontSize: '1em', color: 'rgb(87 83 78)', cursor: 'pointer' }}>
                        Privacy Policy
                    </Typography>
                </Box>
                <Box sx={buttonSX} onClick={() => { router.push('/term'); }} >
                    <Typography variant="body2" sx={{ ml: matches ? '' : 3, mb: 3, fontSize: '1em', color: 'rgb(87 83 78)', cursor: 'pointer' }}>
                        Terms of Service
                    </Typography>
                </Box>
                <Box sx={buttonSX} onClick={() => { router.push('/refundpolicy'); }} >
                    <Typography variant="body2" sx={{ ml: matches ? '' : 3, mb: 3, fontSize: '1em', color: 'rgb(87 83 78)', cursor: 'pointer' }}>
                        Refund Policy
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={3} >
                <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Resources
                </Typography>
                {/* <Typography variant="body2" sx={{ mb: 3, fontSize: '1em', color: 'rgb(87 83 78)' }}>
                    Blog
                </Typography> */}
                <Box sx={buttonSX} onClick={() => { router.push('/faqs'); }} >
                    <Typography variant="body2" sx={{ mb: 3, fontSize: '1em', color: 'rgb(87 83 78)', cursor: 'pointer' }}>
                        FAQ
                    </Typography>
                </Box>

                {/* <Typography variant="body2" sx={{ mb: 3, fontSize: '1em', color: 'rgb(87 83 78)' }}>
                    Help Center
                </Typography> */}
            </Grid>

            {
                !matches &&
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }} >

                    <Typography variant='p'>
                        &#169; Copyright {currentYear} All Rights Reserved by <Link target='_blank' style={{ textDecoration: 'none' }} href={'https://dyotis.com/'}>Dyotis Analytics PVT. LTD</Link>
                    </Typography>
                </Grid>
            }

        </Grid >
    )
}

export default Footer