import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Card,
  CardMedia,
  Tooltip,
  Grid,
  alpha,
  useTheme,
  styled,
  Fade,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DragHandleIcon from '@mui/icons-material/DragHandle';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '95vw',
    maxHeight: '95vh',
    width: '1400px',
    borderRadius: theme.spacing(3),
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    backdropFilter: 'blur(16px)',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(8px)',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(255,255,255,0.95) 100%)',
  backdropFilter: 'blur(20px)',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  overflow: 'visible',
  background: 'transparent',
}));

const ImageCard = styled(Card)(({ theme, variant }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  width: '80%',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: variant === 'output'
    ? '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)'
    : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  border: variant === 'output'
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(16px)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: variant === 'output'
      ? '0 25px 50px -12px rgba(99, 102, 241, 0.25)'
      : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '& .image-overlay': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    '& .image-overlay': {
      opacity: 0.9,
    },
  },
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.3s ease',
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  backgroundColor: 'rgba(99, 102, 241, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  // '&:hover': {
  //   backgroundColor: 'rgba(99, 102, 241, 1)',
  //   transform: 'scale(1.15)',
  //   boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
  // },
}));

const ArrowContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '400px',
  [theme.breakpoints.down('md')]: {
    minHeight: '80px',
    transform: 'rotate(90deg)',
  },
}));

const PlusIcon = styled(AddIcon)(({ theme }) => ({
  fontSize: '4rem',
  color: theme.palette.primary.main,
  opacity: 0.8,
  filter: 'drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2))',
  animation: 'pulse 3s ease-in-out infinite',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 0.8,
    },
    '50%': {
      transform: 'scale(1.15)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 0.8,
    },
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
}));

const EqualsIcon = styled(DragHandleIcon)(({ theme }) => ({
  fontSize: '4rem',
  color: theme.palette.secondary.main,
  opacity: 0.8,
  rotate: '90deg',
  filter: 'drop-shadow(0 4px 6px rgba(156, 163, 175, 0.2))',
  transform: 'rotate(45deg)',
  animation: 'glow 3s ease-in-out infinite',
  '@keyframes glow': {
    '0%': {
      transform: 'rotate(90deg) scale(1)',
      opacity: 0.8,
    },
    '50%': {
      transform: 'rotate(90deg) scale(1.1)',
      opacity: 1,
    },
    '100%': {
      transform: 'rotate(90deg) scale(1)',
      opacity: 0.8,
    },
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
}));

const ImageLabel = styled(Typography)(({ theme, variant }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  color: 'white',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  fontSize: '0.9rem',
  fontWeight: 700,
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 2,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const PlaceholderCard = styled(Box)(({ theme }) => ({
  height: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(16px)',
  color: alpha(theme.palette.text.secondary, 0.8),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const CombineImageModal = ({
  open,
  onClose,
  inputImage1,
  inputImage2,
  outputImage,
  onDownload,
  isLoading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  // Placeholder images from Unsplash
  const placeholderImage1 = 'https://images.unsplash.com/photo-1494790108755-2616c6d1a1b6?w=400&h=300&fit=crop&crop=face';
  const placeholderImage2 = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
  const placeholderOutput = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';

  const displayImage1 = inputImage1 || placeholderImage1;
  const displayImage2 = inputImage2 || placeholderImage2;
  const displayOutput = outputImage || placeholderOutput;

  // Preview handlers
  const handlePreviewOpen = (image, title) => {
    setPreviewImage(image);
    setPreviewTitle(title);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewImage(null);
    setPreviewTitle('');
  };

  return (
    <>
      <StyledDialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullScreen={isMobile}
      >
        <StyledDialogTitle>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Image Combination Process
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <StyledDialogContent>
                   <Grid container spacing={4} alignItems="center">
           {/* First Input Image */}
           <Grid item xs={12} md={3}>
              <ImageCard variant="input">
                <ImageLabel variant="input">Input 1</ImageLabel>
                <CardMedia
                  component="img"
                  height={isMobile ? "300" : "300"}
                  image={displayImage1}
                  referrerPolicy='no-referrer'
                  alt="First input image"
                  sx={{
                    objectFit: 'contain',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.3s ease',
                  }}
                />
                <ImageOverlay className="image-overlay">
                  <Tooltip title="Preview Image">
                    <ActionButton onClick={() => handlePreviewOpen(displayImage1, 'Input Image 1')}>
                      <VisibilityIcon />
                    </ActionButton>
                  </Tooltip>
                  {inputImage1 && (
                    <Tooltip title="Download Image">
                      <ActionButton onClick={() => onDownload && onDownload(displayImage1, 0)}>
                        <DownloadIcon />
                      </ActionButton>
                    </Tooltip>
                  )}
                </ImageOverlay>

              </ImageCard>
            </Grid>
\
             <ArrowContainer>
               <PlusIcon />
             </ArrowContainer>
           <Grid item xs={12} md={3}>
              <ImageCard variant="input">
                <ImageLabel variant="input">Input 2</ImageLabel>
                <CardMedia
                  component="img"
                  height={isMobile ? "300" : "300"}
                  image={displayImage2}
                  referrerPolicy='no-referrer'
                  alt="Second input image"
                  sx={{
                    objectFit: 'contain',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.3s ease'
                  }}
                />
                <ImageOverlay className="image-overlay">
                  <Tooltip title="Preview Image">
                    <ActionButton onClick={() => handlePreviewOpen(displayImage2, 'Input Image 2')}>
                      <VisibilityIcon />
                    </ActionButton>
                  </Tooltip>
                  {inputImage2 && (
                    <Tooltip title="Download Image">
                      <ActionButton onClick={() => onDownload && onDownload(displayImage2, 1)}>
                        <DownloadIcon />
                      </ActionButton>
                    </Tooltip>
                  )}
                </ImageOverlay>
                {!inputImage2 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      right: 12,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: 1.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      textAlign: 'center',
                    }}
                  >
                    Sample Image - Upload your own
                  </Box>
                )}
              </ImageCard>
            </Grid>

                       {/* Equals Icon */}
           {/* <Grid item xs={12} md={1}> */}
             <ArrowContainer>
               <EqualsIcon />
             </ArrowContainer>
           {/* </Grid> */}

           {/* Output Image */}
           <Grid item xs={12} md={4}>
              {isLoading ? (
                <PlaceholderCard>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderTop: `4px solid ${theme.palette.primary.main}`,
                        borderRadius: '50%',
                        animation: 'spin 1.5s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 700, textAlign: 'center' }}>
                      Combining Images...
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: '200px' }}>
                      Please wait while we intelligently merge your images
                    </Typography>
                  </Box>
                </PlaceholderCard>
              ) : (
                <Fade in={!!outputImage} timeout={800}>
                  <ImageCard variant="output">
                    <ImageLabel variant="output">Combined Result</ImageLabel>
                    <CardMedia
                      component="img"
                      height={isMobile ? "300" : "300"}
                      image={displayOutput}
                      referrerPolicy='no-referrer'
                      alt="Combined output image"
                      sx={{
                        objectFit: 'contain',
                        backgroundColor: '#f8fafc',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    <ImageOverlay className="image-overlay">
                      <Tooltip title="Preview Result">
                        <ActionButton onClick={() => handlePreviewOpen(displayOutput, 'Combined Result')}>
                          <VisibilityIcon />
                        </ActionButton>
                      </Tooltip>
                      {outputImage && (
                        <Tooltip title="Download Result">
                          <ActionButton onClick={() => onDownload && onDownload(displayOutput, 0)}>
                            <DownloadIcon />
                          </ActionButton>
                        </Tooltip>
                      )}
                    </ImageOverlay>
                    {!outputImage && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          right: 12,
                          backgroundColor: 'rgba(102, 126, 234, 0.9)',
                          color: 'white',
                          padding: 1.5,
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          textAlign: 'center',
                        }}
                      >
                        Sample Result - Generate your own
                      </Box>
                    )}
                  </ImageCard>
                </Fade>
              )}
            </Grid>
          </Grid>

        
        </StyledDialogContent>
      </StyledDialog>

      {/* Image Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth={false}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            margin: 0,
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handlePreviewClose}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Image Title */}
          {/* <Typography
            variant="h4"
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              color: 'white',
              fontWeight: 600,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          >
            {previewTitle}
          </Typography> */}

          {/* Preview Image */}
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt={previewTitle}
              sx={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          )}

          {/* Instructions */}
          <Typography
            variant="body1"
            sx={{
              position: 'absolute',
              bottom: 20,
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              fontSize: '0.9rem',
            }}
          >
            Press ESC or click the close button to exit preview
          </Typography>
        </Box>
      </Dialog>
    </>
  );
};

export default CombineImageModal; 