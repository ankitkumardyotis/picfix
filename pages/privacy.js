import { Container, Typography } from '@mui/material'
import React from 'react'
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';


function Privacy() {
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Container maxWidth='md' sx={{ marginTop: '5em', minHeight: '100vh' }}>

            <Typography variant={matches ? "h3" : "h4"} sx={{ textAlign: 'center' }}><b>Privacy Policy</b> </Typography> <br /><br />
            <Typography variant="h5" ><b>1. Introduction</b> </Typography><br />
            <Typography variant="p" >Welcome to PicFix.ai. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we handle your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </Typography>

            <Typography mt={5} variant="h5" ><b>2. What Data We Collect</b> </Typography><br />
            <Typography variant='p' mt={2}>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                <ul style={{ marginLeft: '3em', marginTop: '1em', lineHeight: '2em' }}>
                    <li>
                        Identity Data includes first name, last name, username or similar identifier.
                    </li>
                    <li>
                        Contact Data includes email address.
                    </li>
                    <li>
                        Technical Data includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.

                    </li>
                </ul>
            </Typography>

            <Typography mt={5} variant="h5"> <b>3. How We Use Your Data</b></Typography>
            <ul style={{ marginLeft: '3em', marginTop: '1em', lineHeight: '2em' }}>
                <li>
                    To provide you with the services you have requested.
                </li>
                <li>
                    To manage our relationship with you.
                </li>
                <li>
                    To improve our website and services.
                </li>
            </ul>

            <Typography mt={5} variant="h5"> <b>4. Data Security</b></Typography><br />
            <Typography variant='p'>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
            </Typography>

            <Typography mt={5} variant="h5"> <b>5. Data Retention</b></Typography><br />
            <Typography variant='p'>We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                <br />

                For the images you upload to our website, we do not store them beyond 30 minutes after the job is done. After this period, all images are permanently deleted from our servers.

            </Typography>
            <Typography mt={5} variant="h5"> <b>6. Your Legal Rights</b></Typography><br />
            <Typography variant='p'>
                Under certain circumstances, you have rights under data protection laws in relation to your personal data. These include the right to:

                <ul style={{ marginLeft: '3em', marginTop: '1em', lineHeight: '2em' }}>
                    <li>
                        Request access to your personal data.
                    </li>
                    <li>
                        Request correction of your personal data.
                    </li>
                    <li>
                        Request erasure of your personal data.
                    </li>
                    <li>
                        Object to processing of your personal data.
                    </li>
                    <li>
                        Request restriction of processing your personal data.
                    </li>
                    <li>
                        Request transfer of your personal data.
                    </li>
                    <li>
                        Right to withdraw consent.

                    </li>
                </ul>

            </Typography>
            <Typography mt={5} variant="h5"> <b>7. Changes to Privacy Policy</b></Typography><br />
            <Typography variant='p'>We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
            </Typography><br /><br /><br /><br />



        </Container>
    )
}

export default Privacy