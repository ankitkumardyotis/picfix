import React, { useEffect, useState } from 'react'
import HomeIcon from '@mui/icons-material/Home';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PanoramaIcon from '@mui/icons-material/Panorama';
import { CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import MuiTable from '@/components/creditPlanCard-old/MuiTable';
// import prisma from '@/lib/prisma';
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router';
import formattedDate from '@/utils/formateDate/formatDate';
import TabNavigation from '@/components/mobileTabNavigation/TabNavigation';
import Image from 'next/image';
import userPic from '../../public/assets/socialLogin/user.png'
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
    const [isHomeView, setIsHomeView] = useState(false)

    useEffect(() => {
        if (status === "loading") {
            setLoadindSession(true);
        } else if (!session) {
            router.push("/login");
        } else {
            // const fetchUserPlan = async () => {
            //     try {
            //         const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
            //         if (!response.ok) {
            //             throw new Error('Failed to fetch plan data');
            //         }
            //         const data = await response.json();
            //         console.log("data", data.plan)
            //         if (data.plan === null) {
            //             router.push('/price');
            //         } else {
            //             setUserPlan(data.plan);
            //         }
            //     } catch (error) {
            //         console.error('Error fetching plan data:', error);
            //     }
            // };
            // const fetchUserHistory = async () => {
            //     try {
            //         const response = await fetch(`/api/getHistory?userId=${session?.user.id}`);
            //         if (!response.ok) {
            //             throw new Error('Failed to fetch plan data');
            //         }
            //         const data = await response.json();
            //         setUserHistory(data.history)
            //     } catch (error) {
            //         console.error('Error fetching plan data:', error);
            //     }
            // };
            // fetchUserPlan()
            // fetchUserHistory()
            setLoadindSession(false);
        }
    }, [session, status, router]);

    useEffect(() => {

    }, [userHistory])


    // let renewAt;
    // let createdAt;
    // if (userPlan) {
    //     renewAt = formattedDate(userPlan.renewAt)
    //     createdAt = formattedDate(userPlan.createdAt)
    // }

    // console.log("userPlan", userPlan)


    return (
        <>
            {session && matches &&
                <div style={{ flex: 1, marginTop: '3em', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', fontFamily: 'sans-serif', minHeight: '100vh' }}>
                    <div style={{ flex: 1, justifyContent: 'space-between', display: 'flex', flexDirection: 'column', background: 'linear-gradient(59deg,#64d6cf,#f2d49f)' }}>
                        <div style={{ flex: 2, padding: '1em', gap: '1em', display: 'flex', flexDirection: 'column' }}>
                            {/* <div className="logo" style={{ borderRadius: '10px', height: '50px', textAlign: 'center' }}>
                            <Image src={logo} alt="Picture of the author" style={{ width: '100%', height: '100%', borderRadius: '10px' }} />
                        </div> */}
                            <div className="dashboard" onClick={() => router.push('/')} style={{ cursor: 'pointer', backgroundColor: '#ececec', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                                <span style={{ flex: 1 }}><HomeIcon /> </span>
                                <h4 style={{ flex: 3 }}>Home</h4>
                            </div>
                            <div className="dashboard" style={{ cursor: 'pointer', backgroundColor: '#ececec', padding: '12px', borderRadius: '10px', display: 'flex', display: 'flex', alignItems: 'center' }}>
                                <span style={{ flex: 1 }}><SpaceDashboardIcon /></span>
                                <h4 style={{ flex: 3 }}>Dashboard</h4>
                            </div>
                            <div onClick={() => router.push('/#All-AI-Models')} className="dashboard" style={{ backgroundColor: '#ececec', padding: '12px', borderRadius: '10px', display: 'flex', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <span style={{ flex: 1 }}><PanoramaIcon /></span>
                                <h4 style={{ flex: 3 }}>Models</h4>
                            </div>
                        </div>
                        {userPlan?.variantName !== 'Premium' && <div className="premiumCardContainer" style={{ flex: 1.5, padding: '1em' }}>
                            <div style={{ border: '1px solid green', backgroundColor: 'teal', height: '80%', borderRadius: '20px', padding: '1em', textAlign: 'center', position: 'relative' }}>
                                <div className="description" style={{ color: 'white' }}>
                                    <h4>Use our Premium feature now!</h4>
                                </div>
                                <div className="premiumIcon" style={{ color: 'white' }}>
                                    <h1 className='rocket' style={{ fontSize: '4em' }}>🚀</h1>
                                </div>
                                <div className="premiumButton" style={{ backgroundColor: 'green', color: 'white', position: 'absolute', bottom: -17, padding: '.5em', borderRadius: '10px', width: '85%', cursor: 'pointer' }} onClick={() => { router.push('/price') }}>
                                    <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Get Premium</p>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                    {session && <div style={{ flex: 5, backgroundColor: 'white' }}>
                        <div className="welcomeUser" style={{ paddingTop: '1em', paddingLeft: '1em' }}>
                            <h3 style={{ fontSize: '2em', marginBottom: '.2em' }}>Hello, {session?.user.name}</h3>
                            <p>Welcome back!</p>
                        </div>
                        {/* <div className="creditUsage" style={{ display: 'flex', flexDirection: 'row' }} >
                            <div className="creditUsageContainer" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em', margin: '1em', borderRadius: '20px' }}>
                                <h3 style={{ fontSize: '1.5em', }}>Credits Remaining</h3>
                                <p style={{ fontSize: '3em' }}>{userPlan?.creditPoints}</p>

                                <p>Renews At:- {userPlan && renewAt}</p>
                            </div>
                            <div className="creditUsageContainer " style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em', margin: '1em', borderRadius: '20px' }}>
                                <h3 style={{ fontSize: '1.5em', }}>Subscription Details</h3>
                                <p style={{ fontSize: '1.5em' }}>You are using {userPlan?.variantName}</p>

                            </div>
                            <div className="creditUsageContainers" style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em', margin: '1em', borderRadius: '20px' }}>
                            </div>

                        </div>
                        {userHistory.length > 0 && <div className="usageHistory" style={{ paddingLeft: '1em', paddingRight: '1em' }}>
                            <MuiTable userHistory={userHistory} createdAt={createdAt} />
                        </div>} */}

                        <div style={{  backgroundColor: 'white'}}>
                            <div className="subscribedUser" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <h1 style={{ fontSize: '2em', padding: '.1em' }}>Welcome to PicFix AI</h1>
                                <p style={{ fontSize: '1.5em', padding: '1em', color: 'gray' }}> Try our AI models to enhance your images
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '1em', border: 'none' }}>
                                    <button style={{ padding: '1em', borderRadius: '10px', backgroundColor: 'teal', color: 'white', fontSize: '1.2em', cursor: 'pointer' }} onClick={() => { router.push('/#All-AI-Models') }}>Try Now</button>
                                </div>
                            </div>


                        </div>

                    </div>}
                    {/* {session && !userPlan &&  */}
                    {/* when user is not subsribed */}
                    {/* } */}
                </div>
            }

            {
                !matches && session && userPlan &&
                <>
                    <div style={{ padding: " .9rem 1.5rem", minHeight: '100vh', marginTop: '3.3em', fontFamily: 'sans-serif', minHeight: '100vh' }}>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1em' }}>
                            <div style={{ flex: 1, color: 'black', height: '25%', display: 'flex', flexDirection: 'row', gap: '1em' }}>
                                <div>
                                    <Image width={70} height={70} style={{ borderRadius: "50%", border: "1px solid teal" }} src={session?.user.image ? session?.user.image : userPic} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.7em', marginBottom: '.2em' }}>Hello, {session?.user.name}</h3>
                                    <p>Welcome back!</p>
                                </div>
                            </div>
                            <div className='creditUsageContainer' style={{ flex: 1, color: 'black', height: '25%', backgroundColor: 'white', borderRadius: '5px', padding: '1rem 1rem' }}>
                                <div>
                                    <span>
                                        {/* <h3 style={{ fontSize: '1em', marginBottom: '.2em' }}>Hello, {session?.user.name}</h3>
                                    <p>Welcome back!</p> */}
                                        <h3>Total Credits</h3>
                                    </span>
                                    <p style={{ fontSize: '3em', fontFamily: 'sans-serif', fontWeight: '600' }}>{userPlan?.creditPoints}</p>
                                    <p>Renews At:- {userPlan && renewAt}</p>
                                </div>
                            </div>
                            {/* <div style={{ flex: 1, height: '30%', backgroundColor: '#ececec',borderRadius:'10px'  }}>

                            </div> */}
                        </div>
                        {userHistory && <>    <div style={{ paddingLeft: '1rem', textAlign: 'start', marginTop: "3em" }}>
                            <p style={{ fontSize: '1.7em', fontWeight: 'semi-bold' }}> Usage History</p>
                        </div>
                            <div className='creditUsageContainer' style={{ borderRadius: '5px' }}>
                                <MuiTable userHistory={userHistory} createdAt={createdAt} />
                            </div>
                        </>
                        }
                    </div>
                    <TabNavigation />
                </>
            }

            {!session && <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </div>}
            {/* {!userPlan && <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </div>} */}

        </>
    )
}

export default Home