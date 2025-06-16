import React from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

const GeneratedImages = ({ images, isLoading, numOutputs, selectedModel, handlePreview, handleDownload, removeImage }) => {
  const theme = useTheme();
  
  console.log("GeneratedImages component received:", { 
    images, 
    isLoading, 
    numOutputs, 
    selectedModel,
    hasImages: images.some(img => img !== null)
  });
  
  if (!isLoading && !images.some(img => img !== null)) {
    return null;
  }
  
  return (
    <Box sx={{ mt: 3, mb: 6 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Generated Images
      </Typography>
      <Grid container spacing={3}>
        {isLoading ? (
          // Loading placeholders
          Array(selectedModel === 'hair-style' || selectedModel === 'combine-image' || selectedModel === 'text-removal' || selectedModel === 'cartoonify' || selectedModel === 'headshot' || selectedModel === 'restore-image' ? 1 : numOutputs).fill(null).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={`loading-${index}`}>
              <Box
                sx={{
                  width: '100%',
                  height: '300px',
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress />
              </Box>
            </Grid>
          ))
        ) : (
          images.map((image, index) => (
            image && (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '300px',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: theme.shadows[4],
                    '&:hover .image-overlay': {
                      opacity: 1,
                    },
                  }}
                >
                  <img
                    src={image}
                    alt={`Generated ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    className="image-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <Tooltip title="Preview Image">
                      <IconButton
                        onClick={() => handlePreview(image)}
                        sx={{
                          color: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                          },
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Image">
                      <IconButton
                        onClick={() => handleDownload(image, index)}
                        sx={{
                          color: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                          },
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Image">
                      <IconButton
                        onClick={() => removeImage(index)}
                        sx={{
                          color: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            )
          ))
        )}
      </Grid>
    </Box>
  );
};

export default GeneratedImages; 