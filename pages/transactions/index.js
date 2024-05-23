import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { BorderColor } from '@mui/icons-material';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

const index = () => {

    const { status, amount, paymentMethod, customerName, currency, transactionId, email } = router.query;
    const router = useRouter();
    const [paymentHistoryList, setPaymentHistoryList] = useState([]);

    const { data: session } = useSession()

    async function paymentHistory() {
        const response = await fetch(`/api/dataFetchingDB/fetchPaymentHistory?userId=${session.user.id} `)
        const { data } = await response.json()
        setPaymentHistoryList(data)
    }

    useEffect(() => {
        if (session?.user.id) {
            paymentHistory()
        }
    }, [session])

    console.log("paymentHistoryList", paymentHistoryList)

    return (
        <Box
            m="3rem"
            display='flex'
            justifyContent='center'
            flexDirection='column'
            alignItems='center'
            minHeight="90vh"
        >
            {/* <Typography variant="h2" mt={2} >
                Payment History ({paymentHistoryList.length})
            </Typography> */}


            {
                paymentHistoryList.map((item, idx) => {
                    return <Box key={idx} maxWidth='sm' sx={{ display: 'flex', flexDirection: 'row',cursor:'pointer' }} onClick={()=>alert(item.id)}>
                        <List sx={{ width: "100%",minWidth:'30vw', bgcolor: "background.paper" }}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                                </ListItemAvatar>
                                <ListItemText
                                    primary="Invoice "
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: "inline" }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {item.transactionId}
                                            </Typography>
                                           
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </List>
                    </Box>
                })
            }


            {/* <Box
                className="bg-glow"
                boxShadow={2}
                borderRadius={8}
                p={3}
                bgcolor="white"
                maxWidth={500}
                mx="auto"
                textAlign="left"
            >


                <Typography variant="body2" mt={2} color="textSecondary">
                    For any inquiries, please contact software@dyotis.com <br />or call (+91) 0120 4-915-834.
                </Typography>
            </Box> */}

        </Box>
    );
};

export default index;
