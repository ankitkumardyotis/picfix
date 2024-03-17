import React from 'react'
import styles from '@/styles/Home.module.css'
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Container, Icon, Typography, useMediaQuery } from '@mui/material';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { useContext } from 'react';
import AppContext from './AppContext';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

function ExplorePageContainer(props) {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const router = useRouter();
    const context = useContext(AppContext);
    const { data: session } = useSession();




    const images = props.imagesPath
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Logic to update the current image index
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);
        return () => {
            clearInterval(interval); // Clean up the interval on component unmount
        };
    }, []);


    const fetchUserPlan = async () => {
        console.log("kjbhgv")
        try {
            const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
            console.log("response====", response)
            if (!response.ok) {
                throw new Error('Failed to fetch plan data');
            }
            const data = await response.json();
            console.log("data", data)
            // return data.plan;
            // setUserPlan(data.plan)
            // setUserPlanStatus(true)
            return data;
        } catch (error) {
            console.error('Error fetching plan data:', error);
        }
    };

    const path = props.routePath;


    console.log("path", path)
    const handleRunModelButton = async () => {
        // console.log("planData", userPlan)
        console.log("session", session)
        if (!session) {
            router.push("/login")
            context.setFileUrl("")
            localStorage.setItem("path", '/restorePhoto')
            return
        }
        const { plan } = await fetchUserPlan();
        console.log("plan in explore", plan)
        if (!plan && session) {
            router.push("/price")
            context.setFileUrl("")
            // localStorage.setItem("path", "/price")
            return
        }
        if (session && plan) {
            router.push(path)
        }
    }



    return (
        // Outer Box
        <Container maxWidth='xl' sx={{ marginTop: matches ? '6em' : '5em', height: '100vh', paddingBottom: '10em', display: 'flex', alignItems: 'center' }}>
            {/* Inner Box ⬇️*/}
            < Box sx={{ display: 'flex', gap: matches ? '2em' : '', justifyContent: 'space-evenly' }} >
                {/* Left Box */}
                < Box sx={{ width: matches ? '50%' : '100%', display: 'flex', flexDirection: 'column', gap: matches ? '3em' : '1.5em', marginTop: '-.3em' }} >
                    <Box>
                        <Typography variant={matches ? 'h3' : 'h4'} sx={{ lineHeight: '1em' }}><b>  {props.heading} </b> </Typography>
                    </Box>
                    <Box >
                        <Typography variant='p' sx={{ fontSize: matches ? '20px' : '16px' }} >{props.description}</Typography>
                    </Box>
                    {
                        !matches &&
                        <Box>
                            <Box className={styles.animatedImageContainer} sx={{ alignSelf: 'end' }}>
                                <Image src={images[currentImageIndex]} alt="1600 X 900 image resolution  " width={1600} height={900} />
                            </Box>
                        </Box>
                    }

                    <Box className={styles.explorePageButtons} sx={{ display: 'flex', flexDirection: matches ? 'row' : 'column-reverse', marginTop: matches ? '' : '1em' }} >
                        {/* <button>How it works</button> */}
                        <button onClick={handleRunModelButton}>{props.buttonTwoText} <Icon fontSize='small'><ArrowOutwardIcon /></Icon></button>
                    </Box>
                </Box >
                {/* Right Box */}

                < Box sx={{ width: matches ? '50%' : '', }}>
                    {
                        matches &&
                        <Box >
                            <Box className={styles.animatedImageContainer} sx={{ paddingLeft: '50px' }}>
                                <Image src={images[currentImageIndex]} alt="1600 X 900 image resolution  " width={1600} height={900} />
                            </Box>
                        </Box>
                    }
                </Box >
            </Box >


        </Container >

    )
}

export default ExplorePageContainer