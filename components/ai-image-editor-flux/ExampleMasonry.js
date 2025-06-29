import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  Skeleton,
  CircularProgress
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import CompareIcon from '@mui/icons-material/Compare';
import { getUseCaseImageUrl } from '@/constant/getUseCaseImageUrl';
import modelConfigurations from '@/constant/ModelConfigurations';
import ImagePreviewModal from './ImagePreviewModal';

// Cache for images to avoid repeated API calls
const imageCache = new Map();

const ExampleMasonry = ({ selectedModel, selectedGender, onImageClick, onPromptUse }) => {
  const theme = useTheme();
  const [s3Images, setS3Images] = useState([]);
  const [loadingS3Images, setLoadingS3Images] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Comparison modal states
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonImages, setComparisonImages] = useState([]);
  const [comparisonCurrentIndex, setComparisonCurrentIndex] = useState(0);

  // Create cache key for current model and gender
  const cacheKey = useMemo(() => {
    return `${selectedModel}-${selectedGender || 'all'}`;
  }, [selectedModel, selectedGender]);


  const fetchS3Images = useCallback(async () => {
    try {
      // Check cache first
      if (imageCache.has(cacheKey)) {
        const cachedImages = imageCache.get(cacheKey);
        setS3Images(cachedImages);
        setLoadingS3Images(false);
        return;
      }

      setLoadingS3Images(true);
      const useCaseImage = getUseCaseImageUrl.find((item) => item.model === selectedModel);

      if (!useCaseImage) {
        setS3Images([]);
        return;
      }

      // Filter images by gender for hair-style model
      let filteredUseCaseImage = { ...useCaseImage };
      if (selectedModel === 'hair-style' && selectedGender) {
        const genderPrefix = selectedGender.toLowerCase();
        filteredUseCaseImage.useCaseImages = useCaseImage.useCaseImages.filter(image =>
          image.outputImage.startsWith(`${genderPrefix}/`)
        );
      }
      console.log("filteredUseCaseImage", useCaseImage);

      const response = await fetch('/api/getS3ImageUrls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagesPath: filteredUseCaseImage }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("data=============", data);
        if (data.success) {
          // Cache the results
          imageCache.set(cacheKey, data.images);
          setS3Images(data.images);

          // Initialize loading states for new images
          const loadingStates = {};
          data.images.forEach(image => {
            loadingStates[image.id] = true;
          });
          setImageLoadingStates(loadingStates);
        } else {
          console.error('Error fetching S3 images:', data.error);
          setS3Images([]);
        }
      } else {
        console.error('Failed to fetch S3 images');
        setS3Images([]);
      }
    } catch (error) {
      console.error('Error fetching S3 images:', error);
      setS3Images([]);
    } finally {
      setTimeout(() => setLoadingS3Images(false), 100); // Small delay to prevent flicker
    }
  }, [selectedModel, selectedGender, cacheKey]);


  useEffect(() => {
    fetchS3Images();
  }, [fetchS3Images]);

  // Handle individual image loading states
  const handleImageLoad = useCallback((imageId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageId]: false
    }));
  }, []);

  const handleImageLoadStart = useCallback((imageId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageId]: true
    }));
  }, []);

  const handleImagePreview = (image, index) => {
    if (onImageClick) {
      onImageClick({
        url: image.url,
        index: index,
        images: displayImages,
        imageInfo: {
          title: image.title || `Example Image ${index + 1}`,
          prompt: image.prompt || 'AI generated example image',
          model: selectedModel,
          // created: 'Example Image',
          resolution: 'High Quality',
          format: 'JPEG',
          type: 'example'
        }
      });
    }
  };

  const handlePromptUse = (prompt) => {
    if (onPromptUse) {
      onPromptUse(prompt);
    }
  };

  const handleComparisonOpen = (image, index) => {
    if (image.hasComparison && image.url && image.outputUrl) {
      // Get model-specific labels
      const getComparisonLabels = (model) => {
        switch (model) {
          case 'headshot':
            return { before: 'Original Photo', after: 'Professional Headshot' };
          case 'text-removal':
            return { before: 'With Text', after: 'Text Removed' };
          case 'cartoonify':
            return { before: 'Original Photo', after: 'Cartoonified' };
          case 'restore-image':
            return { before: 'Damaged Photo', after: 'Restored Photo' };
          case 'hair-style':
            return { before: 'Original Hair', after: 'New Hair Style' };
          default:
            return { before: 'Before', after: 'After' };
        }
      };

      const labels = getComparisonLabels(selectedModel);
      const modelConfig = modelConfigurations[selectedModel];
      const modelName = modelConfig?.name || selectedModel;

      // Set up images array for modal (just the output image for navigation)
      setComparisonImages([image.outputUrl]);
      setComparisonCurrentIndex(0);

      // Set comparison data
      setComparisonData({
        beforeImage: image.inputUrl,
        afterImage: image.outputUrl,
        beforeLabel: labels.before,
        afterLabel: labels.after,
        title: `${modelName} - Before vs After`,
        imageInfo: {
          title: `${modelName} Result`,
          model: selectedModel,
          resolution: 'High Quality',
          format: 'JPEG',
          type: 'comparison'
        }
      });

      setComparisonModalOpen(true);
    }
  };

  const handleComparisonClose = () => {
    setComparisonModalOpen(false);
    setComparisonData(null);
    setComparisonImages([]);
    setComparisonCurrentIndex(0);
  };

  const handleComparisonImageChange = (newIndex) => {
    setComparisonCurrentIndex(newIndex);
  };

  // Utility function to generate intelligent filename for examples
  const generateExampleFileName = (model, title, prompt) => {
    const config = modelConfigurations[model];
    const usesPrompts = config?.type === 'prompts';

    // Generate random string
    const randomString = Math.random().toString(36).substring(2, 8);

    if (usesPrompts && prompt && prompt.trim()) {
      // Use prompt for filename
      const cleanPrompt = prompt
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 50); // Limit length to 50 characters

      return `example-${cleanPrompt}-${randomString}.jpg`;
    } else if (title && title.trim()) {
      // Use title for filename
      const cleanTitle = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 30); // Limit length to 30 characters

      return `example-${cleanTitle}-${randomString}.jpg`;
    } else {
      // Use model name with random string
      const modelName = config?.name || model;
      const cleanModelName = modelName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      return `example-${cleanModelName}-${randomString}.jpg`;
    }
  };

  const handleDownload = (image, title, prompt) => {
    // For comparison images, download the result/output image by default
    const imageUrl = image.hasComparison && image.outputUrl ? image.outputUrl : (image.url || image);
    const isOutputImage = image.hasComparison && image.outputUrl;

    // Generate intelligent filename
    let filename = generateExampleFileName(selectedModel, title, prompt);

    // Add suffix for output images
    if (isOutputImage) {
      filename = filename.replace('.jpg', '-result.jpg');
    }

    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  };

  // Use S3 images if available, otherwise use hardcoded images
  const displayImages = s3Images.length > 0 && s3Images;
  console.log("displayImages", displayImages);

  // Show loading skeleton when fetching images
  if (loadingS3Images && (!displayImages || displayImages.length === 0)) {
    return (
      <Box sx={{ mt: 1 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Skeleton variant="circular" width={20} height={20} animation="wave" />
            <Skeleton
              variant="text"
              width={`${selectedModel === 'hair-style' && selectedGender ? 180 : 160}px`}
              height={24}
              animation="wave"
            />
          </Box>
        </Box>
        <Masonry
          columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
          sx={{ width: '100%', margin: 0 }}
        >
          {Array.from({ length: 12 }).map((_, index) => {
            // Create varied heights for more realistic masonry layout
            const heights = [220, 280, 320, 240, 300, 260, 350, 200, 290, 310, 270, 330];
            const height = heights[index % heights.length];

            return (
              <Card
                key={`skeleton-${index}`}
                sx={{
                  borderRadius: 2,
                  mb: 2,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height={height}
                  animation="wave"
                  sx={{
                    borderRadius: 0,
                    '&::after': {
                      background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.4)}, transparent)`,
                    }
                  }}
                />
                {/* Add overlay skeleton elements to mimic the overlay buttons */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  <Skeleton variant="circular" width={32} height={32} animation="wave" />
                  <Skeleton variant="circular" width={32} height={32} animation="wave" />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    right: 8,
                  }}
                >
                  <Skeleton variant="rounded" width="60%" height={24} animation="wave" />
                </Box>
              </Card>
            );
          })}
        </Masonry>
      </Box>
    );
  }

  if (!displayImages || displayImages.length === 0) {
    return (
      <Box sx={{ mt: 1, textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No example images available for this model
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      {/* Show loading indicator when switching between cached images */}
      {loadingS3Images && displayImages && displayImages.length > 0 && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={16} height={16} animation="wave" />
            <Skeleton
              variant="text"
              width={`${selectedModel === 'hair-style' && selectedGender ? 140 : 120}px`}
              height={20}
              animation="wave"
            />
          </Box>
        </Box>
      )}
      <Masonry
        columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        // spacing={2}
        sx={{
          width: '100%',
          margin: 0,
          opacity: loadingS3Images ? 0.7 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {displayImages.map((image, index) => (
          <Card
            key={image.id}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              padding: 0,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                '& .image-overlay': {
                  opacity: 1,
                },
              },
            }}
            onClick={() => handleImagePreview(image, index)}
          >
            <Box sx={{ position: 'relative' }}>
              {imageLoadingStates[image.id] && (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={image.height || 250}
                  animation="wave"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                    borderRadius: 1,
                  }}
                />
              )}

              {/* Comparison Available Badge */}


              <CardMedia
                component="img"
                image={image.url}
                alt={image.title || `Example Image ${index + 1}`}
                onLoad={() => handleImageLoad(image.id)}
                onLoadStart={() => handleImageLoadStart(image.id)}
                sx={{
                  width: '100%',
                  height: image.height || 250, // Default height if not specified
                  objectFit: 'cover',
                  transition: 'opacity 0.3s ease',
                  opacity: imageLoadingStates[image.id] ? 0 : 1,
                }}
              />

              {/* Overlay */}
              <Box
                className="image-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  // padding: theme.spacing(2),
                }}
              >
                {/* Top actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2, }}>
                  <Tooltip title="Preview Image">
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        color: theme.palette.text.primary,
                        '&:hover': {
                          backgroundColor: theme.palette.background.paper,
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImagePreview(image, index);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* Comparison button - only show if comparison is available */}
                  {image.hasComparison && (
                    <Tooltip title="Compare Before/After">
                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.9),
                          color: 'white',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.main,
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComparisonOpen(image, index);
                        }}
                      >
                        <CompareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="Download Image">
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        color: theme.palette.text.primary,
                        '&:hover': {
                          backgroundColor: theme.palette.background.paper,
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image, image.title, image.prompt);
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Bottom content */}
                <Box sx={{ p: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {/* {image.title} */}
                  </Typography>
                  {image.prompt && (
                    <Chip
                      label="Use this prompt"
                      size="small"
                      clickable
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.9),
                        color: 'white',
                        fontSize: '10px',
                        height: 24,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePromptUse(image.prompt);
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Card>
        ))}
      </Masonry>

      {/* Comparison Modal using ImagePreviewModal */}
      <ImagePreviewModal
        open={comparisonModalOpen}
        onClose={handleComparisonClose}
        images={comparisonImages}
        currentIndex={comparisonCurrentIndex}
        onImageChange={handleComparisonImageChange}
        selectedModel={selectedModel}
        imageInfo={comparisonData?.imageInfo}
        canCompare={true}
        beforeImage={comparisonData?.beforeImage}
        afterImage={comparisonData?.afterImage}
        beforeLabel={comparisonData?.beforeLabel}
        afterLabel={comparisonData?.afterLabel}
        autoOpenComparison={true}
      />
    </Box>
  );
};

export default ExampleMasonry; 