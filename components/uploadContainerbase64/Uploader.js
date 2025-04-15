import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

import React from 'react'

function Uploader({ handleImageUpload }) {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <div style={{
            width: matches ? '30rem' : "20rem",
            border: "2px dashed black",
            textAlign: 'center',
            borderRadius: '5px',
            height:matches? '20rem':"15rem",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '10px'
        }}>
            <label htmlFor="imageUpload" style={styles.uploadLabel}>
                <input
                    id="imageUpload"
                    type="file"
                    accept="image/heic, image/heif, image/jpeg, image/png, image/jpg"
                    onChange={handleImageUpload}
                    style={styles.uploadInput}
                />
                <span style={styles.uploadText}>Upload an Image</span>
            </label>
        </div>
    )
}

export default Uploader


const styles = {
    uploadLabel: {
        display: "inline-block",
        padding: '20px',
        backgroundColor: '#000',
        color: 'white',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-Color 0.3s ease',
        hover: {
            backgroundColor: "teal"
        }
    },
    uploadInput: {
        display: "none"
    },
    uploadText: {
        display: "inline - block",
        padding: "0 10px",
        cursor: "pointer",
    },
}