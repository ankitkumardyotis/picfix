import React from 'react'
import CommunityGallery from '@/components/CommunityGallery'
import { Box, Container } from '@mui/material'

function index() {
    return (
        <Container sx={{
            maxWidth: '100%',
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            borderRadius: '10px',
            margin: '20px',
            overflow: 'hidden',
            marginTop: '5rem',
        }}>
            <CommunityGallery />
        </Container>
    )
}

export default index