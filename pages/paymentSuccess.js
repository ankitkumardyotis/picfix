import React from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { BorderColor } from '@mui/icons-material';
import Image from 'next/image';
import successIcon from '../public/assets/success_icon.gif'

const PaymentReceipt = () => {

    const router = useRouter();
    const { status, amount, paymentMethod, customerName, currency, transactionId, email } = router.query;


    return (
        <Box
            m="3rem"
            display='flex'
            justifyContent='center'
            flexDirection='column'
            alignItems='center'
            minHeight="90vh"
        >
            <Box
                className="bg-glow"
                boxShadow={2}
                borderRadius={8}
                p={3}
                bgcolor="white"
                maxWidth={500}
                mx="auto"
                textAlign="left"
            >
                <Box display='flex' justifyContent='center' alignItems='center'>

                    <Image src={successIcon} width={100} height={100} />
                </Box>
                {/* <Typography variant="h5" gutterBottom>
                    Thank you for purchasing...
                </Typography> */}
                <Divider />
                <Typography mt={2} variant="body1" paragraph>
                    <strong>Transaction ID:</strong> {transactionId}
                </Typography>

                <Typography variant="body1" paragraph>
                    <strong>E-mail:</strong> {email}
                </Typography>
                <Typography variant="body1" paragraph>
                    <strong>Currency :</strong> {currency}
                </Typography>
                <Typography variant="body1" paragraph>
                    <strong>Status :</strong> {status}
                </Typography>
                <Typography variant="body1" paragraph>
                    <strong>Amount:</strong> {amount / 100}
                </Typography>
                <Typography variant="body1" paragraph>
                    <strong>Payment Method:</strong> {paymentMethod}
                </Typography>
                <Divider />
                <Typography variant="body2" mt={2} color="textSecondary">
                    For any inquiries, please contact software@dyotis.com <br />or call (+91) 0120 4-915-834.
                </Typography>
            </Box>
            {/* <Box mt={2}>
                <Button variant="contained" color="info"  sx={{border:'1px solid black', backgroundColor: 'black', color: 'white' }}>Explore Your First Model</Button>
            </Box> */}
        </Box>
    );
};

export default PaymentReceipt;
