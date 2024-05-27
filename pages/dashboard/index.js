import React, { useEffect, useState } from 'react'
import HomeIcon from '@mui/icons-material/Home';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PanoramaIcon from '@mui/icons-material/Panorama';
import { Box, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
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
// import CountUp from 'react-countup';
function Home() {

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));


    const { data: session, status } = useSession()
    // console.log("session", session)
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
                    console.log("data ===>", data.plan)
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

    console.log("userPlan", userPlan)

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
                (<div style={{ flex: 1, marginTop: '3em', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', fontFamily: 'sans-serif', minHeight: '100vh' }}>
                    {matches && <div style={{ flex: 1, justifyContent: 'space-between', display: 'flex', flexDirection: 'column', background: 'linear-gradient(59deg,#64d6cf,#f2d49f)' }}>
                        <div style={{ flex: 2, padding: '1em', gap: '1em', display: 'flex', flexDirection: 'column' }}>
                            <Box className="dashboard " onClick={() => router.push('/')} sx={{ cursor: 'pointer', backgroundColor: '#ececec', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', "&:hover": { backgroundColor: '#adb5bd', transition: '.2s ease-in-out' } }}>
                                <span style={{ flex: 1 }}><HomeIcon /> </span>
                                <h4 style={{ flex: 3 }}>Home</h4>
                            </Box>
                            <Box className={selectComponent === 'dashboard' && "bg-glow-border"} onClick={() => setSelectComponent('dashboard')} sx={{backgroundColor: selectComponent != 'dashboard' && '#ececec', cursor: 'pointer', padding: '12px', borderRadius: '10px', display: 'flex', display: 'flex', alignItems: 'center', "&:hover": { backgroundColor: '#adb5bd', transition: '.2s ease-in-out' } }}>
                                <span style={{ flex: 1 }}><SpaceDashboardIcon /></span>
                                <h4 style={{ flex: 3 }}>Dashboard</h4>
                            </Box>
                            <Box onClick={() => router.push('/#All-AI-Models')} className="dashboard" sx={{ backgroundColor: '#ececec', padding: '12px', borderRadius: '10px', display: 'flex', display: 'flex', alignItems: 'center', cursor: 'pointer', "&:hover": { backgroundColor: '#adb5bd', transition: '.2s ease-in-out' } }}>
                                <span style={{ flex: 1 }}><PanoramaIcon /></span>
                                <h4 style={{ flex: 3 }}>Models</h4>
                            </Box>
                            <Box onClick={() => setSelectComponent('transactions')} className={selectComponent === 'transactions' && "bg-glow-border"} sx={{ backgroundColor: selectComponent != 'transactions' && '#ececec', padding: '12px', borderRadius: '10px', display: 'flex', display: 'flex', alignItems: 'center', cursor: 'pointer', "&:hover": { backgroundColor: '#adb5bd', transition: '.2s ease-in-out' } }}>
                                <span style={{ flex: 1 }}><ReceiptLongIcon /></span>
                                <h4 style={{ flex: 3 }}>Transactions</h4>
                            </Box>
                        </div>
                    </div>}

                    {selectComponent === 'dashboard' && <Dashboard matches={matches} session={session} renewAt={renewAt} userPlan={userPlan} userHistory={userHistory} createdAt={createdAt} />}
                    {selectComponent === 'transactions' && < TransactionsHistory />}
                </div>)
            }
        </>
    )
}

export default Home



