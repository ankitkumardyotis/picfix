import React, { useEffect, useState } from 'react'
import HomeIcon from '@mui/icons-material/Home';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PanoramaIcon from '@mui/icons-material/Panorama';
import { Box, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
// import prisma from '@/lib/prisma';
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router';
import formattedDate from '@/utils/formateDate/formatDate';
import TabNavigation from '@/components/mobileTabNavigation/TabNavigation';
import Image from 'next/image';
import userPic from '../../public/assets/socialLogin/user.png'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Dashboard from '@/components/dashboardComponent/Dashboard';
import TransactionsHistory from '@/components/dashboardComponent/TransactionsHistory';
import AllModelsContainer from '@/components/AllModelsContainer';
import Link from 'next/link';
import { styled } from '@mui/material/styles';
// import CountUp from 'react-countup';


const StyledButton = styled(Button)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: '1em',
    borderRadius: theme.spacing(3),
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.8rem',
    width: '80%',
    margin: '0 auto',
    marginBottom: '1em',
    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
    '&:hover': {
        background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
        // transform: 'translateY(-2px)',
        boxShadow: '0 6px 30px rgba(102, 126, 234, 0.4)',
    },
    '&.Mui-disabled': {
        background: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
        // transform: 'none',
        boxShadow: 'none',
    },
    transition: 'all 0.3s ease',
}));
function Home() {

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));


    const { data: session, status } = useSession()
    const router = useRouter()
    const [userPlan, setUserPlan] = useState(null)
    const [userHistory, setUserHistory] = useState([])
    const [loadindSession, setLoadindSession] = useState(true)
    const [selectComponent, setSelectComponent] = useState('dashboard')

    useEffect(() => {
        if (status === "loading") {
            setLoadindSession(true);
        } else if (!session) {
            router.push("/login");
        } else {
            setLoadindSession(true);
            const fetchUserPlan = async () => {
                try {
                    const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch plan data');
                    }
                    const data = await response.json();
                    if (data.plan === null) {
                        router.push('/price');
                    } else {
                        setUserPlan(data.plan);
                    }
                } catch (error) {
                    console.error('Error fetching plan data:', error);
                }
            };
            const fetchUserHistory = async () => {
                try {
                    const response = await fetch(`/api/getHistory?userId=${session?.user.id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch plan data');
                    }
                    const data = await response.json();
                    setUserHistory(data.history)
                } catch (error) {
                    console.error('Error fetching plan data:', error);
                }
            };
            fetchUserPlan()
            fetchUserHistory()
            setLoadindSession(false);
        }
    }, [session, status, router]);

    useEffect(() => {

    }, [userHistory])


    let renewAt;
    let createdAt;
    if (userPlan) {
        renewAt = formattedDate(userPlan.expiredAt)
        createdAt = formattedDate(userPlan.createdAt)
    }


    if (!session) {
        return <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </div>
    }
    if (!userPlan) {
        return <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </div>
    }

    return (
        <>
            {session &&
                (<div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    fontFamily: 'sans-serif',
                    height: '100vh',
                    // marginTop: '3em'
                }}>
                    {/* Fixed Sidebar */}
                    {matches && (
                        <div style={{
                            position: 'fixed',
                            left: 0,
                            // top: '3em',
                            width: '15vw',
                            height: 'calc(100vh)',
                            background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            zIndex: 1000,
                            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                flex: 2,
                                padding: '1em',
                                gap: '1em',
                                display: 'flex',
                                flexDirection: 'column',
                                marginTop: '1em'
                            }}>
                                {/* logo */}
                                <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '1.5em', justifyContent: 'center', }}>
                                    <Link href="/">
                                        <Image src="/assets/PicFixAILogo.jpg" alt="Logo" width={180} height={40} style={{ borderRadius: '5px' }} />
                                    </Link>
                                </div>
                                <Box className="dashboard " onClick={() => router.push('/')} sx={{ cursor: 'pointer', backgroundColor: '#ececec', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', "&:hover": { backgroundColor: '#adb5bd', transition: '.2s ease-in-out' } }}>
                                    <span style={{ flex: 1 }}><HomeIcon /> </span>
                                    <h4 style={{ flex: 3 }}>Home</h4>
                                </Box>
                                <Box className={selectComponent === 'dashboard' && "bg-glow-border"} onClick={() => setSelectComponent('dashboard')} sx={{ backgroundColor: selectComponent != 'dashboard' && '#ececec', cursor: 'pointer', padding: '12px', borderRadius: '10px', display: 'flex', display: 'flex', alignItems: 'center', "&:hover": { backgroundColor: '#adb5bd', transition: '.2s ease-in-out' } }}>
                                    <span style={{ flex: 1 }}><SpaceDashboardIcon /></span>
                                    <h4 style={{ flex: 3 }}>Dashboard</h4>
                                </Box>

                                <Box onClick={() => setSelectComponent('transactions')} className={selectComponent === 'transactions' && "bg-glow-border"} sx={{ backgroundColor: selectComponent != 'transactions' && '#ececec', padding: '12px', borderRadius: '10px', display: 'flex', display: 'flex', alignItems: 'center', cursor: 'pointer', "&:hover": { backgroundColor: '#adb5bd', transition: '.2s ease-in-out' } }}>
                                    <span style={{ flex: 1 }}><ReceiptLongIcon /></span>
                                    <h4 style={{ flex: 3 }}>Transactions</h4>
                                </Box>
                            </div>
                            <StyledButton onClick={() => router.push('/ai-image-editor')} >
                                <span><PanoramaIcon /></span>
                                <h4 >AI Studio</h4>
                            </StyledButton>
                        </div>
                    )}

                    {/* Scrollable Main Content */}
                    <div style={{
                        flex: 1,
                        marginLeft: matches ? '15vw' : '0',
                        height: 'calc(100vh - 3em)',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}>
                        {selectComponent === 'dashboard' && <Dashboard matches={matches} session={session} renewAt={renewAt} userPlan={userPlan} userHistory={userHistory} createdAt={createdAt} />}
                        {selectComponent === 'transactions' && < TransactionsHistory />}
                        {selectComponent === 'ai-studio' && <div style={{ padding: '1rem' }}><AiStudio /></div>}
                        {/* {selectComponent === 'models' && <div style={{ padding: '1rem' }}><AllModelsContainer /></div>} */}
                    </div>
                </div>)
            }
        </>
    )
}

export default Home



