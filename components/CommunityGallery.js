import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  alpha,
  useTheme,
  Container,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LoginIcon from '@mui/icons-material/Login';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import modelConfigurations from '../constant/ModelConfigurations';
import ImagePreviewModal from './ai-image-editor-flux/ImagePreviewModal';

const CommunityGallery = () => {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { enqueueSnackbar } = useSnackbar();
  const [communityImages, setCommunityImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalImages, setTotalImages] = useState(0);

  // Preview modal states (same as ExampleMasonry)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewType, setPreviewType] = useState('community');
  const [exampleImages, setExampleImages] = useState([]);
  const [exampleImageInfo, setExampleImageInfo] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  const IMAGES_PER_PAGE = 12;

  // Store all images in state for efficient pagination
  const [allCommunityImages, setAllCommunityImages] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Fetch all community images once using optimized API
  const fetchAllCommunityImages = async () => {
    try {
      setLoading(true);

      // Use the unified API that fetches both community and example images
      const response = await fetch('/api/images/getUnifiedGallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          page: 1,
          limit: 200, // Get more images in one call
          sortBy: 'createdAt'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const allImages = data.images;
          
          console.log('Unified gallery fetched successfully:', {
            total: allImages.length,
            communityCount: data.communityCount,
            exampleCount: data.exampleCount,
            firstImage: allImages[0],
            hasLikeData: allImages[0]?.userLiked !== undefined
          });

          // Debug: Log the first few images to see their types
          console.log('First 5 images details:', allImages.slice(0, 5).map(img => ({
            id: img.id,
            isCommunity: img.isCommunity,
            isExample: img.isExample,
            model: img.model,
            url: img.url ? img.url.substring(0, 100) + '...' : 'No URL'
          })));

          // Debug: Count image types
          const communityImages = allImages.filter(img => img.isCommunity);
          const exampleImages = allImages.filter(img => img.isExample);
          console.log('Image breakdown:', {
            totalImages: allImages.length,
            communityImages: communityImages.length,
            exampleImages: exampleImages.length,
            exampleModels: exampleImages.map(img => img.model)
          });
          
          setAllCommunityImages(allImages);
          setTotalImages(allImages.length);
          setImagesLoaded(true);
          
          // Set initial page
          const initialImages = allImages.slice(0, IMAGES_PER_PAGE);
          setCommunityImages(initialImages);
          setHasMore(allImages.length > IMAGES_PER_PAGE);
          
          // Initialize loading states for images
          const loadingStates = {};
          initialImages.forEach((image, index) => {
            loadingStates[`community-${image.id || index}`] = true;
          });
          setImageLoadingStates(loadingStates);
        } else {
          console.error('Error fetching community images:', data.error);
          setAllCommunityImages([]);
          setCommunityImages([]);
          setTotalImages(0);
        }
      } else {
        console.error('Failed to fetch community images');
        setAllCommunityImages([]);
        setCommunityImages([]);
        setTotalImages(0);
      }
      
    } catch (error) {
      console.error('Error fetching community images:', error);
      setAllCommunityImages([]);
      setCommunityImages([]);
      setTotalImages(0);
    } finally {
      setLoading(false);
    }
  };

  // Paginate from loaded images
  const loadMoreImages = () => {
    const startIndex = currentPage * IMAGES_PER_PAGE;
    const endIndex = startIndex + IMAGES_PER_PAGE;
    const nextImages = allCommunityImages.slice(startIndex, endIndex);
    
    setCommunityImages(prev => [...prev, ...nextImages]);
    setHasMore(endIndex < allCommunityImages.length);
    
    // Initialize loading states for new images
    const newLoadingStates = {};
    nextImages.forEach((image, index) => {
      newLoadingStates[`community-${image.id || (startIndex + index)}`] = true;
    });
    setImageLoadingStates(prev => ({ ...prev, ...newLoadingStates }));
  };

  useEffect(() => {
    fetchAllCommunityImages();
  }, []);

  const handleShowMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadMoreImages();
  };

  // Image click handler (same pattern as ExampleMasonry)
  const handleCommunityImageClick = (imageData) => {
    setPreviewImage(imageData.url);
    setCurrentImageIndex(imageData.index);
    setPreviewType('community');
    setExampleImages(communityImages);
    setExampleImageInfo({
      title: imageData.title || 'Community Creation',
      prompt: imageData.prompt || 'AI Generated Image',
      model: imageData.model,
      resolution: 'High Quality',
      format: 'JPEG',
      type: 'community',
      author: imageData.author,
      createdAt: imageData.createdAt,
      likes: imageData.likes,
      downloads: imageData.downloads,
      views: imageData.views,
      userLiked: imageData.userLiked,
      publishedImageId: imageData.publishedImageId
    });
    setPreviewOpen(true);
  };

  // Handle preview modal close
  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewImage(null);
    setCurrentImageIndex(0);
    setPreviewType('community');
    setExampleImages([]);
    setExampleImageInfo(null);
  };

  // Handle image navigation in preview
  const handleImageChange = (newIndex) => {
    setCurrentImageIndex(newIndex);
    if (communityImages[newIndex]) {
      setPreviewImage(communityImages[newIndex].url);
      setExampleImageInfo({
        title: communityImages[newIndex].title || 'Community Creation',
        prompt: communityImages[newIndex].prompt || 'AI Generated Image',
        model: communityImages[newIndex].model,
        resolution: 'High Quality',
        format: 'JPEG',
        type: 'community',
        author: communityImages[newIndex].author,
        createdAt: communityImages[newIndex].createdAt,
        likes: communityImages[newIndex].likes,
        downloads: communityImages[newIndex].downloads,
        views: communityImages[newIndex].views,
        userLiked: communityImages[newIndex].userLiked,
        publishedImageId: communityImages[newIndex].publishedImageId
      });
    }
  };

  // Handle prompt use (navigate to AI editor)
  const handlePromptUse = (prompt, model) => {
    const modelRoutes = {
      'generate-image': '/ai-image-editor',
      'hair-style': '/ai-image-editor',
      'headshot': '/ai-image-editor',
      'cartoonify': '/ai-image-editor',
      'restore-image': '/restorePhoto',
      'text-removal': '/ai-image-editor',
      'reimagine': '/ai-image-editor',
      'combine-image': '/ai-image-editor'
    };
    
    const route = modelRoutes[model] || '/ai-image-editor';
    router.push(route);
  };

  // Image loading state handlers (same as ExampleMasonry)
  const handleImageLoad = (imageId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageId]: false
    }));
  };

  const handleImageError = (imageId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageId]: false
    }));
  };

  // Handle like/unlike functionality for both community and example images
  const handleLikeToggle = async (image, currentlyLiked) => {
    if (!session) {
      enqueueSnackbar('Please log in to like images', { variant: 'warning' });
      router.push('/login');
      return;
    }

    try {
      const action = currentlyLiked ? 'unlike' : 'like';
      
      // Determine if it's a community or example image
      const isExampleImage = image.isExample;
      const requestBody = {
        action: action
      };

      // Add the appropriate ID field
      if (isExampleImage) {
        requestBody.exampleImageId = image.exampleImageId;
      } else {
        requestBody.publishedImageId = image.publishedImageId;
      }

      const response = await fetch('/api/images/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the image in the state (works for both types)
        const updateFunction = (img) => {
          if (isExampleImage) {
            return img.exampleImageId === image.exampleImageId 
              ? { ...img, likes: data.likes, userLiked: data.userLiked }
              : img;
          } else {
            return img.publishedImageId === image.publishedImageId 
              ? { ...img, likes: data.likes, userLiked: data.userLiked }
              : img;
          }
        };

        setCommunityImages(prev => prev.map(updateFunction));
        setAllCommunityImages(prev => prev.map(updateFunction));

        enqueueSnackbar(
          action === 'like' ? '❤️ Liked!' : '💔 Unliked', 
          { variant: 'success' }
        );
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.error || 'Failed to update like', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      enqueueSnackbar('Failed to update like', { variant: 'error' });
    }
  };

  // Get model display name
  const getModelDisplayName = (model) => {
    return modelConfigurations[model]?.name || model;
  };

  // Get model color
  const getModelColor = (model) => {
    const colors = {
      'generate-image': '#667eea',
      'hair-style': '#f093fb',
      'headshot': '#4facfe',
      'cartoonify': '#43e97b',
      'restore-image': '#fa709a',
      'text-removal': '#fee140',
      'reimagine': '#a8edea',
      'combine-image': '#d299c2'
    };
    return colors[model] || '#667eea';
  };

  if (communityImages.length === 0 && !loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <AutoAwesomeIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h5" color="textSecondary" gutterBottom>
            No images in gallery yet
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            Be the first to share your AI-generated creations!
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 4, fontStyle: 'italic' }}>
            💡 Create images in the AI editor and click the "Publish" button to share them here. You'll also see curated example images!
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/ai-image-editor')}
            sx={{
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              borderRadius: 3,
              px: 4,
              py: 1.5
            }}
          >
            Start Creating & Publishing
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          AI Gallery
        </Typography>
        <Typography 
          variant="h6" 
          color="textSecondary" 
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Discover amazing AI-generated images from our community and curated examples
        </Typography>
        
        {totalImages > 0 && (
          <Chip 
            label={`${totalImages} community creations`}
            variant="outlined"
            sx={{ 
              fontSize: '0.9rem',
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main
            }}
          />
        )}
      </Box>

      {/* Show loading indicator when switching between cached images */}
      {loading && communityImages && communityImages.length > 0 && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={16} height={16} animation="wave" />
            <Skeleton
              variant="text"
              width="140px"
              height={20}
              animation="wave"
            />
          </Box>
        </Box>
      )}

      {/* Community Images Masonry (same structure as ExampleMasonry) */}
      <Masonry
        columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        spacing={1}
        sx={{
          width: '100%',
          margin: 0,
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {communityImages.map((image, index) => {
          const imageId = `community-${image.id || index}`;
          const isLoading = imageLoadingStates[imageId] !== false;

          return (
            <Box
              key={imageId}
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  '& .image-actions': {
                    opacity: 1,
                  }
                },
              }}
              onClick={() => handleCommunityImageClick({
                ...image,
                index,
                images: communityImages
              })}
            >
              {/* Loading overlay */}
              {isLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              )}

                            {/* Model and Type Badges */}
              <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2, display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                <Chip 
                  label={getModelDisplayName(image.model)}
                  size="small"
                  sx={{
                    backgroundColor: getModelColor(image.model),
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 600,
                    height: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                />
                {/* {image.isExample && (
                  <Chip 
                    label="Example"
                    size="small"
                    sx={{
                      backgroundColor: alpha('#ff9800', 0.9),
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 600,
                      height: 18,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                )}
                {image.isCommunity && (
                  <Chip 
                    label="Community"
                    size="small"
                    sx={{
                      backgroundColor: alpha('#4caf50', 0.9),
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 600,
                      height: 18,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                )} */}
              </Box>

              <img
                src={image.url}
                alt={image.title || 'Community creation'}
                style={{
                  width: '100%',
                  height: `${image.height || 280}px`,
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: '8px',
                }}
                onLoad={() => handleImageLoad(imageId)}
                onError={() => handleImageError(imageId)}
              />

              {/* Like button overlay (top-right) - Always visible */}
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: alpha('#000000', 0.75),
                    borderRadius: 3,
                    px: 1.5,
                    py: 1,
                    gap: 0.75,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <Tooltip title={!session ? "Login to like" : image.userLiked ? "Unlike" : "Like"}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(image, image.userLiked);
                      }}
                      sx={{
                        color: image.userLiked ? '#ff4757' : '#ffffff',
                        p: 0.5,
                        '&:hover': {
                          transform: 'scale(1.3)',
                          color: '#ff4757',
                          backgroundColor: alpha('#ffffff', 0.1)
                        },
                        transition: 'all 0.2s ease',
                        borderRadius: 2
                      }}
                    >
                      {!session ? (
                        <LoginIcon fontSize="medium" />
                      ) : image.userLiked ? (
                        <FavoriteIcon fontSize="medium" />
                      ) : (
                        <FavoriteBorderIcon fontSize="medium" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      minWidth: '16px',
                      textAlign: 'center'
                    }}
                  >
                    {image.likes || 0}
                  </Typography>
                </Box>
              </Box>

              {/* Action overlay (same as ExampleMasonry) */}
              <Box
                className="image-actions"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  padding: 1.5,
                }}
              >
                {/* Bottom content */}
                <Box sx={{ p: 1 }}>
                  {/* Author info for community images */}
                  {image.author && (
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
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePromptUse(image.prompt, image.model);
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}

        {/* Loading Skeletons */}
        {loading && communityImages.length === 0 && (
          Array(IMAGES_PER_PAGE).fill(null).map((_, index) => (
            <Box key={`skeleton-${index}`} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={Math.floor(Math.random() * 100) + 200}
                animation="wave"
              />
            </Box>
          ))
        )}
      </Masonry>

      {/* Show More Button */}
      {hasMore && !loading && (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleShowMore}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 30px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Loading...' : 'Show More'}
          </Button>
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Showing {communityImages.length} of {totalImages} images
          </Typography>
        </Box>
      )}

      {/* Call to Action */}
      {!hasMore && communityImages.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 6, p: 4, borderRadius: 3, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
          <Typography variant="h6" gutterBottom>
            🎨 Ready to create your own masterpiece?
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Join our community and share your AI-generated creations alongside curated examples!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/ai-image-editor')}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            }}
          >
            Start Creating Now
          </Button>
        </Box>
      )}

      {/* Enhanced Preview Modal (same as ai-image-editor) */}
      <ImagePreviewModal
        open={previewOpen}
        onClose={handlePreviewClose}
        images={communityImages.map(img => img.url)}
        currentIndex={currentImageIndex}
        onImageChange={handleImageChange}
        selectedModel={exampleImageInfo?.model || 'generate-image'}
        imageInfo={exampleImageInfo}
        canCompare={false}
        beforeImage={null}
        afterImage={null}
        beforeLabel="Before"
        afterLabel="After"
        autoOpenComparison={false}
      />
    </Container>
  );
};

export default CommunityGallery; 