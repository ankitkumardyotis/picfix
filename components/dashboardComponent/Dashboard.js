import React from 'react'
import MuiTable from '../creditPlanCard-old/MuiTable'
import TabNavigation from '../mobileTabNavigation/TabNavigation'
import Image from 'next/image'

function Dashboard({ session, userPlan, createdAt, userHistory, renewAt, matches }) {
    if (matches) return (
        <div style={{ flex: 5, backgroundColor: 'white' }}>
            <div className="welcomeUser" style={{ paddingTop: '1em', paddingLeft: '1em' }}>
                <h3 style={{ fontSize: '2em', marginBottom: '.2em' }}>Hello, {session?.user.name}</h3>
                <p>Welcome back!</p>
            </div>
            <div className="creditUsage" style={{ display: 'flex', flexDirection: 'row' }} >
                <div className="creditUsageContainer" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em', margin: '1em', borderRadius: '20px' }}>
                    <h3 style={{ fontSize: '1.5em', }}>Credits Remaining</h3>
                    <p style={{ fontSize: '3em', color: userPlan?.remainingPoints > 10 ? 'black' : 'red' }}>{userPlan?.remainingPoints}</p>

                    <p>Renews At:- {userPlan && renewAt}</p>
                </div>
                <div className="creditUsageContainers" style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em', margin: '1em', borderRadius: '20px' }}>
                </div>

            </div>
            {userHistory.length > 0 && <div className="usageHistory" style={{ paddingLeft: '1em', paddingRight: '1em' }}>
                <MuiTable userHistory={userHistory} createdAt={createdAt} />
            </div>}
        </div>
    )
    if (!matches) return (
        <div style={{ height: '100vh' }}>
            <div style={{ padding: " .9rem 1.5rem", minHeight: '100vh', marginTop: '3.3em', fontFamily: 'sans-serif', }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1em' }}>
                    <div style={{ flex: 1, color: 'black', height: '25%', display: 'flex', flexDirection: 'row', gap: '1em' }}>
                        <div>
                            <Image width={70} height={70} style={{ borderRadius: "50%", border: "1px solid teal" }} src={session?.user.image ? session?.user.image : userPic} />
                        </div>
                        <div style={{ paddingBottom: '.6em' }}>
                            <h3 style={{ fontSize: '1.7em', marginBottom: '.2em' }}>Hello, {session?.user.name}</h3>
                            <p>Welcome back!</p>
                        </div>
                    </div>
                    <div className='creditUsageContainer' style={{ flex: 1, color: 'black', height: '25%', backgroundColor: 'white', borderRadius: '5px', padding: '1rem 1rem' }}>
                        <div>
                            <span>

                                <h3>Total Credits</h3>
                            </span>
                            <p style={{ fontSize: '3em', fontFamily: 'sans-serif', fontWeight: '600', color: userPlan?.remainingPoints > 10 ? 'black' : 'red' }}>{userPlan?.remainingPoints}</p>
                            <p>Renews At:- {userPlan && renewAt}</p>
                        </div>
                    </div>
                    {/* <div style={{ flex: 1, height: '30%', backgroundColor: '#ececec',borderRadius:'10px'  }}>

        </div> */}
                </div>
                {userHistory && <>    <div style={{ paddingLeft: '1rem', textAlign: 'start', marginTop: "3em", marginBottom: '1em' }}>
                    <p style={{ fontSize: '1.7em', fontWeight: 'semi-bold' }}> Usage History</p>
                </div>
                    <div className='creditUsageContainer' style={{ borderRadius: '5px' }}>
                        <MuiTable userHistory={userHistory} createdAt={createdAt} />
                    </div>
                </>
                }
            </div>
            <TabNavigation />
        </div>
    )

}

export default Dashboard