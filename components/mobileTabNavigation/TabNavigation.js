import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import HomeIcon from '@mui/icons-material/Home';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PanoramaIcon from '@mui/icons-material/Panorama';
import { useRouter } from 'next/router';

export default function TabNavigation() {
    const [value, setValue] = React.useState(1);
    const router = useRouter()

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Tabs value={value}
            onChange={handleChange}
            aria-label="icon label tabs example"
            indicatorColor='black'
            TabIndicatorProps={{ style: { background: "teal"} }}
            textColor="primary"
            sx={{
                position: 'fixed', bottom: 0, width: '100%', backgroundColor: 'white',border:'1px solid teal' , ".Mui-selected": {
                    color: 'teal',
                },
            }}
        >
            <Tab indicatorColor="inherit" sx={{ width: '30%' }} color='black' icon={<HomeIcon color='black' />} label="Home" onClick={() => router.push("/")} />
            <Tab indicatorColor="secondary" sx={{ width: '40%' }} icon={<SpaceDashboardIcon color='#000000' />} label="My Account" onClick={() => router.push("/dashboard")} />
            <Tab sx={{ width: '30%' }} icon={<PanoramaIcon />} label="Models" onClick={() => router.push("/#All-AI-Models")} />
        </Tabs>
    );
}