import React from 'react'

function Uploader({ handleImageUpload }) {
    return (
        <div style={styles.uploadContainer}>
            <label htmlFor="imageUpload" style={styles.uploadLabel}>
                <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
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
    uploadContainer: {
        textAlign: 'center',
        width: '30rem',
        border: '2px dotted black',
        borderRadius: '5px',
        height: '20rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '10px'
    },
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