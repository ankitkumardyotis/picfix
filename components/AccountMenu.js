import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { useRouter } from 'next/router';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import ColorizeIcon from '@mui/icons-material/Colorize';
import TransformIcon from '@mui/icons-material/Transform';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BrushIcon from '@mui/icons-material/Brush';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { Icon } from '@mui/material';
import { useContext } from 'react';
import AppContext from './AppContext';

export default function AccountMenu() {
    // logout
    const context = useContext(AppContext);
    const session = true
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState("");
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (event) => {
        setAnchorEl(null);

    };
    return (
        <React.Fragment>
            <Icon
                onClick={handleClick}
                size="large"
                // sx={{ pr: 8 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{ cursor: 'pointer' }}
                fontSize='large'
            // cursor="pointer"
            >
                <WidgetsIcon fontSize='large' />
                {/* < Avatar alt={user ? user.name : "jhbhb"} src={user && user.picture} /> */}
            </Icon >
            <Menu
                autoFocus={false}
                disableScrollLock={true}
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* <MenuItem onClick={handlePaymentContainer} >
                    <UpgradeIcon fontSize="large" />  Buy Credits
                </MenuItem> */}
                {/* <MenuItem onClick={handleClose}>
                    <Avatar /> My account
                </MenuItem>
                    <Divider />
             */}
                <MenuItem onClick={() => {
                    router.push('/AIModels/restorePhoto');
                }}>
                    <ListItemIcon>
                        <BrokenImageIcon fontSize="small" />
                    </ListItemIcon>
                    Restore Photos
                </MenuItem>
                <MenuItem onClick={() => {
                    router.push('/AIModels/imageColorization')
                }}>
                    <ListItemIcon>
                        <ColorizeIcon fontSize="small" />
                    </ListItemIcon>
                    Image Colorization
                </MenuItem>
                <MenuItem onClick={() => {
                    router.push('/AIModels/removeBackground')
                }}>
                    <ListItemIcon>
                        <TransformIcon fontSize="small" />
                    </ListItemIcon>
                    Remove Background
                </MenuItem>
                <MenuItem onClick={() => {
                    router.push('/AIModels/clothingFashion')
                }}>
                    <ListItemIcon>
                        <WhatshotIcon fontSize="small" />
                    </ListItemIcon>
                    Trendy Look
                </MenuItem>
                <MenuItem onClick={() => {
                    router.push('/AIModels/designRoom')
                    context.setFileUrl('')
                }}>
                    <ListItemIcon>
                        <BrushIcon fontSize="small" />
                    </ListItemIcon>
                    Design Room
                </MenuItem>
                {/* <MenuItem onClick={() => {
                    router.push('/AIModels/removeObject')
                }}>
                    <ListItemIcon>
                        <RemoveCircleIcon fontSize="small" />
                    </ListItemIcon>
                    Remove Object
                </MenuItem> */}
                {/* <Divider /> */}
                {/* <MenuItem onClick={()=>signOut()} >
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem> */}
            </Menu>
        </React.Fragment>
    );
}
