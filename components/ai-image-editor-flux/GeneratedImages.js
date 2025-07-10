import React, { useState } from 'react';
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
import CompareIcon from '@mui/icons-material/Compare';
import PublishIcon from '@mui/icons-material/Publish';
import PublishDialog from './PublishDialog';

const GeneratedImages = ({ 
  images, 
  isLoading, 
  numOutputs, 
  selectedModel, 
  handlePreview, 
  handleDownload, 
  removeImage, 
  canCompare, 
  handleComparePreview,
  // New props for publishing
  onPublish,
  inputPrompt,
  currentState
}) => {
  const theme = useTheme();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedImageForPublish, setSelectedImageForPublish] = useState({ url: null, index: null });
  
  console.log("GeneratedImages component received:", { 
    images, 
    isLoading, 
    numOutputs, 
    selectedModel,
    hasImages: images.some(img => img !== null)
  });

  // Test image loading outside of the complex component structure
  React.useEffect(() => {
    const validImages = images.filter(img => img !== null);
    if (validImages.length > 0) {
      validImages.forEach((imageUrl, index) => {
        console.log(`Testing direct image load for image ${index + 1}:`, imageUrl);
        
        // Create a test image element
        const testImg = new Image();
        testImg.onload = () => {
          console.log(`✅ Direct test load successful for image ${index + 1}:`, imageUrl);
          console.log(`Direct load dimensions:`, testImg.naturalWidth, 'x', testImg.naturalHeight);
        };
        testImg.onerror = (e) => {
          console.error(`❌ Direct test load failed for image ${index + 1}:`, imageUrl, e);
        };
        testImg.src = imageUrl;
      });
    }
  }, [images]);

  const handlePublishClick = (imageUrl, index) => {
    setSelectedImageForPublish({ url: imageUrl, index });
    setPublishDialogOpen(true);
  };

  const handlePublishSubmit = async (publishData) => {
    if (onPublish && selectedImageForPublish.url) {
      await onPublish({
        imageUrl: selectedImageForPublish.url,
        imageIndex: selectedImageForPublish.index,
        title: publishData.title,
        description: publishData.description
      });
    }
  };

  const handlePublishDialogClose = () => {
    setPublishDialogOpen(false);
    setSelectedImageForPublish({ url: null, index: null });
  };
  
  if (!isLoading && !images.some(img => img !== null)) {
    return null;
  }
  
  return (
    <>
    <Box sx={{ mt: 3, mb: 6 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Generated Images
      </Typography>
      <Grid container spacing={3}>
        {isLoading ? (
          // Loading placeholders
            Array(selectedModel === 'hair-style' || selectedModel === 'combine-image' || selectedModel === 'text-removal' || selectedModel === 'cartoonify' || selectedModel === 'headshot' || selectedModel === 'restore-image' || selectedModel === 'reimagine' ? 1 : numOutputs).fill(null).map((_, index) => (
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
                    // backgroundColor: '#f0f0f0', // Removed debug styling
                    // border: '2px solid red', // Removed debug border
                    '&:hover .image-overlay': {
                      opacity: 1,
                    },
                  }}

                >
                  <img
                    key={`img-${image}-${index}`}
                    src={image}
                    alt={`Generated ${index + 1}`}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onLoad={(e) => {
                      console.log(`✅ Image ${index + 1} loaded successfully:`, image);
                      console.log(`Image natural dimensions:`, e.target.naturalWidth, 'x', e.target.naturalHeight);
                      console.log(`Image display dimensions:`, e.target.width, 'x', e.target.height);
                    }}
                    onError={(e) => {
                      console.error(`❌ Image ${index + 1} failed to load:`, image);
                      console.error(`Error details:`, e);
                      console.error(`Error type:`, e.type);
                      console.error(`Target src:`, e.target.src);
                    }}
                    onLoadStart={() => console.log(`🔄 Image ${index + 1} loading started:`, image)}
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
                        gap: 1,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                        flexWrap: 'wrap',
                        padding: 1
                    }}
                  >
                    <Tooltip title="Preview Image">
                      <IconButton
                        onClick={() => handlePreview(image, index)}
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
                      
                    {canCompare && handleComparePreview && (
                      <Tooltip title="Compare Images">
                        <IconButton
                          onClick={() => handleComparePreview(image, index)}
                          sx={{
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.2)',
                            },
                          }}
                        >
                          <CompareIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                      
                      <Tooltip title="Publish to Community">
                        <IconButton
                          onClick={() => handlePublishClick(image, index)}
                          sx={{
                            color: 'white',
                            backgroundColor: 'rgba(102, 126, 234, 0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 1)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <PublishIcon />
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

      {/* Publish Dialog */}
      <PublishDialog
        open={publishDialogOpen}
        onClose={handlePublishDialogClose}
        imageUrl={selectedImageForPublish.url}
        selectedModel={selectedModel}
        prompt={inputPrompt}
        onPublish={handlePublishSubmit}
      />
    </>
  );
};

export default GeneratedImages; 