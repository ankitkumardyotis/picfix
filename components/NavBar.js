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
    const { data: session } = useSession();
    const router = useRouter();

    const handleDiologueBox = () => {
        setOpen(true);
    }

    const imageStyle = {
        borderRadius: '5px',
    };
    const handleGetStarted = () => {
        router.push('/dashboard')
    }
    return (
        <div className='navbar'>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div >
                    <Link href="/">
                        <Image style={imageStyle} src="/assets/PicFixAILogo.jpg" alt="Logo" width={210} height={40} />
                    </Link>
                </div>
                <div  >
                <AccountMenu />
                    {/* {session ? <AccountMenu /> : <div>
                        <button onClick={handleGetStarted} style={{ padding: '.5em', borderRadius: '5px', cursor: 'pointer', fontSize: '1em', backgroundColor: 'black', color: 'rgb(100, 214, 207)', border: 'none' }}>Get started </button>
                    </div>} */}

                </div>
            </div>
        </div>
    );
}

export default NavBar;
