import Link from 'next/link';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import AccountMenu from './AccountMenu';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { useState } from 'react';
import { Box, Container } from '@mui/material';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';


function NavBar({ open, setOpen }) {
    //   const { data: session } = useSession();
    const session = true

    const handleDiologueBox = () => {
        setOpen(true);
    }

    const imageStyle = {
        borderRadius: '5px',
    };

    return (
        <div className='navbar'>
            <Container maxWidth="xl" sx={{display:'flex',justifyContent:'space-between'}}>
                <Box >
                    <Link href="/">
                        <Image style={imageStyle} src="/assets/PicFixAILogo.jpg" alt="Logo" width={210} height={40} />
                    </Link>
                </Box>
                <Box >

                    <AccountMenu />

                </Box>
            </Container>
        </div>
    );
}

export default NavBar;
