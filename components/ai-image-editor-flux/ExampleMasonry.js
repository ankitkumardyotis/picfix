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
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import CompareIcon from '@mui/icons-material/Compare';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUseCaseImageUrl } from '@/constant/getUseCaseImageUrl';
import modelConfigurations from '@/constant/ModelConfigurations';
import ImagePreviewModal from './ImagePreviewModal';
import Image from 'next/image';
// Cache for images to avoid repeated API calls
const imageCache = new Map();

const ExampleMasonry = ({ selectedModel, selectedGender, onImageClick, onPromptUse }) => {
  const theme = useTheme();
  const [s3Images, setS3Images] = useState([]);
  const [loadingS3Images, setLoadingS3Images] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Community images state
  const [communityImages, setCommunityImages] = useState([]);
  const [loadingCommunityImages, setLoadingCommunityImages] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);

  // History state
  const [historyImages, setHistoryImages] = useState([]);
  const [loadingHistoryImages, setLoadingHistoryImages] = useState(false);
  const [activeTab, setActiveTab] = useState('examples'); // 'examples', 'community', 'history'

  // Comparison modal states
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonImages, setComparisonImages] = useState([]);
  const [comparisonCurrentIndex, setComparisonCurrentIndex] = useState(0);

  // Delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Create cache key for current model and gender
  const cacheKey = useMemo(() => {
    return `${selectedModel}-${selectedGender || 'all'}`;
  }, [selectedModel, selectedGender]);

  // Create cache key for community images
  const communityCacheKey = useMemo(() => {
    return `community-${selectedModel}`;
  }, [selectedModel]);


  const fetchS3Images = useCallback(async () => {
    try {
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

  const fetchCommunityImages = useCallback(async () => {
    try {
      // Check cache first
      if (imageCache.has(communityCacheKey)) {
        const cachedImages = imageCache.get(communityCacheKey);
        setCommunityImages(cachedImages);
        setLoadingCommunityImages(false);
        return;
      }

      setLoadingCommunityImages(true);

      const response = await fetch('/api/images/getCommunityImages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          limit: 12
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Community images data:", data);
        if (data.success) {
          // Cache the results
          imageCache.set(communityCacheKey, data.images);
          setCommunityImages(data.images);

          // Initialize loading states for new images
          const loadingStates = {};
          data.images.forEach(image => {
            loadingStates[image.id] = true;
          });
          setImageLoadingStates(prev => ({ ...prev, ...loadingStates }));
        } else {
          console.error('Error fetching community images:', data.error);
          setCommunityImages([]);
        }
      } else {
        console.error('Failed to fetch community images');
        setCommunityImages([]);
      }
    } catch (error) {
      console.error('Error fetching community images:', error);
      setCommunityImages([]);
    } finally {
      setTimeout(() => setLoadingCommunityImages(false), 100);
    }
  }, [selectedModel, communityCacheKey]);

  const fetchUserHistory = useCallback(async () => {
    try {
      const historyCacheKey = `history-${selectedModel}`;

      // Check cache first
      if (imageCache.has(historyCacheKey)) {
        const cachedImages = imageCache.get(historyCacheKey);
        setHistoryImages(cachedImages);
        setLoadingHistoryImages(false);
        return;
      }

      setLoadingHistoryImages(true);

      const response = await fetch(`/api/user/history?model=${selectedModel}&limit=20`);

      if (response.ok) {
        const data = await response.json();
        console.log("User history data:", data);
        if (data.success) {
          // Transform history data to match masonry format
          const transformedHistory = data.history.map(record => ({
            id: `history-${record.id}`,
            url: record.url,
            outputUrl: record.url,
            inputUrl: record.inputImages?.[0]?.url || null,
            inputUrls: record.inputImages || [],
            title: record.prompt || `${record.model} Result`,
            prompt: record.prompt,
            height: 250 + Math.floor(Math.random() * 100), // Random height for masonry
            isCommunity: false,
            isHistory: true,
            isPublished: record.isPublished,
            author: 'You',
            hasComparison: record.hasComparison,
            modelParams: record.modelParams,
            aspectRatio: record.aspectRatio,
            createdAt: record.createdAt,
            historyId: record.id, // Store original history ID for publishing
            // Add combine-image specific properties
            inputImage1: record.inputImage1 || null,
            inputImage2: record.inputImage2 || null,
            outputImage: record.url
          }));

          // Cache the results
          imageCache.set(historyCacheKey, transformedHistory);
          setHistoryImages(transformedHistory);

          // Initialize loading states for new images
          const loadingStates = {};
          transformedHistory.forEach(image => {
            loadingStates[image.id] = true;
          });
          setImageLoadingStates(prev => ({ ...prev, ...loadingStates }));
        } else {
          console.error('Error fetching user history:', data.error);
          setHistoryImages([]);
        }
      } else {
        console.error('Failed to fetch user history');
        setHistoryImages([]);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
      setHistoryImages([]);
    } finally {
      setTimeout(() => setLoadingHistoryImages(false), 100);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityImages();
    } else if (activeTab === 'history') {
      fetchUserHistory();
    } else {
      fetchS3Images();
    }
  }, [activeTab, fetchS3Images, fetchCommunityImages, fetchUserHistory]);

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

  // Helper function to generate model configuration text
  const generateModelConfigText = (model, image, modelParams) => {
    const config = modelConfigurations[model];
    if (!config) return null;

    const configParts = [];

    switch (model) {
      case 'hair-style':
        if (modelParams?.hair_style && modelParams.hair_style !== 'No change' && modelParams.hair_style !== 'Random') {
          configParts.push(`${modelParams.hair_style} hairstyle`);
        }
        if (modelParams?.hair_color && modelParams.hair_color !== 'No change') {
          configParts.push(`${modelParams.hair_color.toLowerCase()} hair color`);
        }
        if (modelParams?.gender && modelParams.gender !== 'None') {
          configParts.push(`${modelParams.gender.toLowerCase()} styling`);
        }
        break;

      case 'headshot':
        if (modelParams?.background && modelParams.background !== 'None') {
          configParts.push(`${modelParams.background.toLowerCase()} background`);
        }
        if (modelParams?.gender && modelParams.gender !== 'None') {
          configParts.push(`${modelParams.gender.toLowerCase()} professional headshot`);
        }
        break;

      case 'reimagine':
        if (modelParams?.scenario && modelParams.scenario !== 'Random') {
          configParts.push(modelParams.scenario);
        }
        if (modelParams?.gender && modelParams.gender !== 'None') {
          configParts.push(`${modelParams.gender.toLowerCase()} scenario`);
        }
        break;

      case 'text-removal':
        configParts.push('Text and watermark removal');
        break;

      case 'cartoonify':
        configParts.push('Cartoon style transformation');
        break;

      case 'restore-image':
        configParts.push('Image restoration and enhancement');
        break;

      case 'gfp-restore':
        configParts.push('GFP image restoration');
        break;

      case 'home-designer':
        configParts.push('Interior design transformation');
        break;

      case 'background-removal':
        configParts.push('AI background removal');
        break;

      case 'remove-object':
        configParts.push('AI object removal');
        break;

      case 'combine-image':
        configParts.push('Image combination');
        break;

      default:
        if (config.name) {
          configParts.push(config.name);
        }
    }

    // Add aspect ratio if available
    if (modelParams?.aspect_ratio && modelParams.aspect_ratio !== 'match_input_image') {
      configParts.push(`${modelParams.aspect_ratio} aspect ratio`);
    }

    return configParts.length > 0 ? configParts.join(', ') : null;
  };

  const handleImagePreview = (image, index) => {
    if (onImageClick) {
      // Generate model configuration text for images without prompts
      const modelConfigText = !image.prompt && image.modelParams
        ? generateModelConfigText(selectedModel, image, image.modelParams)
        : null;

      // Check if comparison data is available for this image
      const hasComparison = image.hasComparison && image.inputUrl && image.outputUrl;

      // Get comparison labels if available
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
          case 're-imagine':
            return { before: 'Original Photo', after: 'Reimagined Scenario' };
          default:
            return { before: 'Before', after: 'After' };
        }
      };

      const labels = hasComparison ? getComparisonLabels(selectedModel) : null;

      // Special handling for combine-image model
      const combineData = selectedModel === 'combine-image' && image.inputImage1 && image.inputImage2 ? {
        inputImage1: image.inputImage1,
        inputImage2: image.inputImage2,
        outputImage: image.outputImage || image.url
      } : null;


      onImageClick({
        url: image.url,
        index: index,
        images: displayImages.map(img => ({
          ...img,
          url: img.url
        })),
        imageInfo: {
          // title: image.title || (image.isCommunity ? 'Community Image' : `Example Image ${index + 1}`),
          prompt: image.prompt || null,
          modelConfig: modelConfigText,
          model: selectedModel,
          modelParams: image.modelParams || null,
          createdAt: image.createdAt || null,
          resolution: 'High Quality',
          format: 'JPEG',
          type: image.isCommunity ? 'community' : (image.isHistory ? 'history' : 'example')
        },
        // Add comparison data if available
        canCompare: hasComparison,
        beforeImage: hasComparison ? image.inputUrl : null,
        afterImage: hasComparison ? image.outputUrl : null,
        beforeLabel: hasComparison ? labels.before : null,
        afterLabel: hasComparison ? labels.after : null,
        // Add combine data for combine-image model
        combineData: combineData
      });
    }
  };

  const handlePromptUse = (prompt) => {
    if (onPromptUse) {
      onPromptUse(prompt);
    }
  };

  const handlePublishFromHistory = async (historyId, title) => {
    try {
      const response = await fetch('/api/images/publishFromHistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyId,
          title: title || 'My Creation'
        })
      });

      if (response.ok) {
        console.log('Image published successfully');
        // Refresh history to update the published status
        const historyCacheKey = `history-${selectedModel}`;
        imageCache.delete(historyCacheKey); // Clear cache
        fetchUserHistory(); // Refresh history
      } else {
        const errorData = await response.json();
        console.error('Error publishing image:', errorData.error);
      }
    } catch (error) {
      console.error('Error publishing image:', error);
    }
  };

  // Handle delete history item
  const handleDeleteClick = (image) => {
    setItemToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !itemToDelete.historyId) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/user/deleteHistory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyId: itemToDelete.historyId
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('History item deleted successfully:', result);

        // Remove the item from local state immediately
        setHistoryImages(prev => prev.filter(img => img.historyId !== itemToDelete.historyId));

        // Clear cache to ensure fresh data on next fetch
        const historyCacheKey = `history-${selectedModel}`;
        imageCache.delete(historyCacheKey);

        // Close dialog
        setDeleteDialogOpen(false);
        setItemToDelete(null);

        // Optional: Show success message if you have a notification system
        console.log(`Deleted ${result.details.totalFiles} files from storage and database record`);
      } else {
        const errorData = await response.json();
        console.error('Error deleting history item:', errorData.error);

        // Handle published image case
        if (errorData.published) {
          alert('Cannot delete published images. Please unpublish the image first.');
        } else {
          alert(errorData.error || 'Failed to delete history item');
        }
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
      alert('Failed to delete history item. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleComparisonOpen = (image, index) => {
    if (image.hasComparison && image.inputUrl && image.outputUrl) {
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
          case 're-imagine':
            return { before: 'Original Photo', after: 'Reimagined Scenario' };
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

      // Generate model configuration text for comparison
      const modelConfigText = !image.prompt && image.modelParams
        ? generateModelConfigText(selectedModel, image, image.modelParams)
        : null;

      // Set comparison data
      setComparisonData({
        beforeImage: image.inputUrl,
        afterImage: image.outputUrl,
        beforeLabel: labels.before,
        afterLabel: labels.after,
        title: `${modelName} - Before vs After`,
        imageInfo: {
          title: image.title || `${modelName} Result`,
          prompt: image.prompt || null,
          modelConfig: modelConfigText,
          model: selectedModel,
          createdAt: image.createdAt || null,
          resolution: 'High Quality',
          format: 'JPEG',
          type: image.isCommunity ? 'community-comparison' : 'example-comparison'
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
    const imageUrl = image.hasComparison && image.outputUrl ? image.outputUrl : (image.url || image);
    const isOutputImage = image.hasComparison && image.outputUrl;

    // Generate filename
    let filename = generateExampleFileName(selectedModel, title, prompt);

    // Add suffix for output images
    if (isOutputImage) {
      filename = filename.replace('.jpg', '-result.jpg');
    }

    // Use API endpoint to download with proper headers
    const downloadUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;

    // Create link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;

    // Add to DOM temporarily, click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Use appropriate images based on active tab
  const displayImages = activeTab === 'community' ? communityImages :
    activeTab === 'history' ? historyImages :
      (s3Images.length > 0 ? s3Images : []);
  console.log("displayImages", displayImages, "activeTab:", activeTab);

  // Show loading skeleton when fetching images
  const isLoading = activeTab === 'community' ? loadingCommunityImages :
    activeTab === 'history' ? loadingHistoryImages :
      loadingS3Images;

  return (
    <Box sx={{ mt: 1 }}>
      {/* Toggle between Examples and Community */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {activeTab === 'community' ? 'Community Images' :
            activeTab === 'history' ? 'My History' :
              'Example Images'}
        </Typography>

        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(e, value) => {
            if (value) {
              setActiveTab(value);
            }
          }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.5,
              fontSize: '12px',
              borderRadius: '20px',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }
            }
          }}
        >
          <ToggleButton value="examples">Examples</ToggleButton>
          <ToggleButton value="history">History</ToggleButton>
          <ToggleButton value="community">Community</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Conditional Content Rendering */}
      {isLoading && (!displayImages || displayImages.length === 0) ? (
        // Show loading skeleton when fetching images and no images exist
        <Box>
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
      ) : (!displayImages || displayImages.length === 0) ? (
        // Show empty state when no images and not loading
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 'community' ? 'No community images available for this model' :
              activeTab === 'history' ? 'No history images available for this model' :
                'No example images available for this model'}
          </Typography>
        </Box>
      ) : (
        // Show images when available
        <>
          {/* Show loading indicator when switching between cached images */}
          {isLoading && displayImages && displayImages.length > 0 && (
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
            sx={{
              width: '100%',
              margin: 0,
              opacity: isLoading ? 0.7 : 1,
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

                  {/* Community Badge */}
                  {image.isCommunity && (
                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                      <Chip
                        label="Community"
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.9),
                          color: 'white',
                          fontSize: '10px',
                          height: 20
                        }}
                      />
                    </Box>
                  )}

                  {/* History Badge */}
                  {image.isHistory && (
                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                      <Chip
                        label={image.isPublished ? "Published" : "History"}
                        size="small"
                        sx={{
                          backgroundColor: image.isPublished ?
                            alpha(theme.palette.success.main, 0.9) :
                            alpha(theme.palette.secondary.main, 0.9),
                          color: 'white',
                          fontSize: '10px',
                          height: 20
                        }}
                      />
                    </Box>
                  )}

                  <CardMedia
                    component="img"
                    image={selectedModel === 'combine-image' ? image.outputImage : image.url}
                    alt={image.title || `Example Image ${index + 1}`}
                    onLoad={() => handleImageLoad(image.id)}
                    onLoadStart={() => handleImageLoadStart(image.id)}
                    referrerPolicy="no-referrer"
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
                      {image.hasComparison && image.inputUrl && image.outputUrl && selectedModel !== 'combine-image' && (
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

                      {/* Delete button - only show for history images */}
                      {image.isHistory && (
                        <Tooltip title="Delete from History">
                          <IconButton
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.error.main, 0.9),
                              color: 'white',
                              '&:hover': {
                                backgroundColor: theme.palette.error.main,
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(image);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    {/* Bottom content */}
                    <Box sx={{ p: 1 }}>
                      {/* Community image title */}
                      {image.isCommunity && image.title && (
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                            mb: 1,
                            fontSize: '12px'
                          }}
                        >
                          {image.title}
                        </Typography>
                      )}

                      {/* Author info for community images */}
                      {image.isCommunity && image.author && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: alpha('#ffffff', 0.8),
                            fontSize: '10px',
                            mb: 1,
                            display: 'block'
                          }}
                        >
                          by {image.author}
                        </Typography>
                      )}

                      {/* Prompt chip - Only show for models that use prompts */}
                      {image.prompt && ['generate-image', 'combine-image', 'home-designer'].includes(selectedModel) && (
                        <Chip
                          label="Use this prompt"
                          size="small"
                          clickable
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.9),
                            color: 'white',
                            fontSize: '10px',
                            height: 24,
                            mr: 1,
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

                      {/* Publish chip for unpublished history images */}
                      {image.isHistory && !image.isPublished && (
                        <Chip
                          label="Publish"
                          size="small"
                          clickable
                          sx={{
                            backgroundColor: alpha(theme.palette.success.main, 0.9),
                            color: 'white',
                            fontSize: '10px',
                            height: 24,
                            '&:hover': {
                              backgroundColor: theme.palette.success.main,
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishFromHistory(image.historyId, image.title);
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}
          </Masonry>
        </>
      )}

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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this image from your history?
            {/* <br /><br />
            <strong>This action will:</strong>
            <br />• Remove the image from your history permanently
            <br />• Delete all associated files from cloud storage
            <br />• This cannot be undone
            {itemToDelete?.isPublished && (
              <>
                <br /><br />
                <strong style={{color: '#f44336'}}>Note:</strong> This image appears to be published. 
                You may need to unpublish it first.
              </>
            )} */}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            color="error"
            variant="contained"
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExampleMasonry; 