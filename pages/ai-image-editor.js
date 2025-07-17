import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import AppContext from '../components/AppContext';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Card,
  CardMedia,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
  styled,
  alpha,
  useTheme,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useRouter } from 'next/router';
import SendIcon from '@mui/icons-material/Send';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import ImageIcon from '@mui/icons-material/Image';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BrushIcon from '@mui/icons-material/Brush';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FaCrown, FaGift } from "react-icons/fa";
import Head from 'next/head';
import { useSnackbar } from 'notistack';
import GeneratedImages from '../components/ai-image-editor-flux/GeneratedImages';
import ImageUploader from '../components/ai-image-editor-flux/ImageUploader';
import ExampleMasonry from '../components/ai-image-editor-flux/ExampleMasonry';
import ImagePreviewModal from '../components/ai-image-editor-flux/ImagePreviewModal';
import BackgroundRemovalProcessor from '../components/ai-image-editor-flux/BackgroundRemovalProcessor';
import ObjectRemovalMaskEditor from '../components/ai-image-editor-flux/ObjectRemovalMaskEditor';
import modelConfigurations from '../constant/ModelConfigurations';
import { getModelInputImages, getModelParameters } from '../lib/publishImageHandler';
import Image from 'next/image';
import Link from 'next/link';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f7fa 0%,rgb(232, 230, 218) 100%)',
  height: '100vh',
  width: '99.3vw',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
}));

const SidePanel = styled(Box)(({ theme }) => ({
  width: '250px',
  background: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  padding: theme.spacing(2,3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  overflow: 'auto',
  boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    position: 'absolute',
    zIndex: 1000,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease',
    '&.open': {
      transform: 'translateX(0)',
    },
  },
}));

const MainEditor = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1,3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  overflow: 'auto',
  background: alpha(theme.palette.background.default, 0.5),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  '& .MuiInputBase-input': {
    // padding: theme.spacing(1),
    // paddingLeft: theme.spacing(2),
    fontSize: '14px',
  },
}));



const MenuButton = styled(IconButton)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 1001,
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
  },
}));

const AppStyleCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const AppStyleIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: theme.spacing(2.5),
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  border: '3px solid transparent',
  transition: 'all 0.2s ease',
  '&.selected': {
    border: `3px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}, 0 4px 12px rgba(0,0,0,0.2)`,
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const AppStyleLabel = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontSize: '12px',
  fontWeight: 500,
  textAlign: 'center',
  color: theme.palette.text.secondary,
  maxWidth: 80,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export default function AIImageEditor() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const context = useContext(AppContext);
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState('generate-image');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [numOutputs, setNumOutputs] = useState(2);
  const [generatedImages, setGeneratedImages] = useState(Array(2).fill(null));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hair style specific states
  const [selectedHairStyle, setSelectedHairStyle] = useState('No change');
  const [selectedHairColor, setSelectedHairColor] = useState('No change');
  const [selectedGender, setSelectedGender] = useState('Male');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadingHairImage, setUploadingHairImage] = useState(false);

  // Text removal specific states
  const [textRemovalImage, setTextRemovalImage] = useState(null);
  const [textRemovalImageUrl, setTextRemovalImageUrl] = useState(null);
  const [uploadingTextRemovalImage, setUploadingTextRemovalImage] = useState(false);

  // Cartoonify specific states
  const [cartoonifyImage, setCartoonifyImage] = useState(null);
  const [cartoonifyImageUrl, setCartoonifyImageUrl] = useState(null);
  const [uploadingCartoonifyImage, setUploadingCartoonifyImage] = useState(false);

  // Headshot specific states
  const [headshotImage, setHeadshotImage] = useState(null);
  const [headshotImageUrl, setHeadshotImageUrl] = useState(null);
  const [uploadingHeadshotImage, setUploadingHeadshotImage] = useState(false);
  const [selectedHeadshotGender, setSelectedHeadshotGender] = useState('None');
  const [selectedHeadshotBackground, setSelectedHeadshotBackground] = useState('Neutral');

  // Restore image specific states
  const [restoreImage, setRestoreImage] = useState(null);
  const [restoreImageUrl, setRestoreImageUrl] = useState(null);
  const [uploadingRestoreImage, setUploadingRestoreImage] = useState(false);

  // GFP Restore specific states
  const [gfpRestoreImage, setGfpRestoreImage] = useState(null);
  const [gfpRestoreImageUrl, setGfpRestoreImageUrl] = useState(null);
  const [uploadingGfpRestoreImage, setUploadingGfpRestoreImage] = useState(false);

  // Home Designer specific states
  const [homeDesignerImage, setHomeDesignerImage] = useState(null);
  const [homeDesignerImageUrl, setHomeDesignerImageUrl] = useState(null);
  const [uploadingHomeDesignerImage, setUploadingHomeDesignerImage] = useState(false);

  // Background Removal specific states
  const [backgroundRemovalImage, setBackgroundRemovalImage] = useState(null);
  const [backgroundRemovalImageUrl, setBackgroundRemovalImageUrl] = useState(null);
  const [uploadingBackgroundRemovalImage, setUploadingBackgroundRemovalImage] = useState(false);
  const [backgroundRemovalStatus, setBackgroundRemovalStatus] = useState('Loading model...');
  const [processingBackgroundRemoval, setProcessingBackgroundRemoval] = useState(false);

  // Remove Object specific states
  const [removeObjectImage, setRemoveObjectImage] = useState(null);
  const [removeObjectImageUrl, setRemoveObjectImageUrl] = useState(null);
  const [uploadingRemoveObjectImage, setUploadingRemoveObjectImage] = useState(false);
  const [removeObjectMask, setRemoveObjectMask] = useState(null);
  const [hasMaskDrawn, setHasMaskDrawn] = useState(false);

  // ReImagine specific states
  const [reimagineImage, setReimagineImage] = useState(null);
  const [reimagineImageUrl, setReimagineImageUrl] = useState(null);
  const [uploadingReimagineImage, setUploadingReimagineImage] = useState(false);
  const [selectedReimagineGender, setSelectedReimagineGender] = useState('None');
  const [selectedScenario, setSelectedScenario] = useState('Random');

  // Combine image specific states
  const [combineImage1, setCombineImage1] = useState(null);
  const [combineImage2, setCombineImage2] = useState(null);
  const [combineImage1Url, setCombineImage1Url] = useState(null);
  const [combineImage2Url, setCombineImage2Url] = useState(null);
  const [uploadingCombine1, setUploadingCombine1] = useState(false);
  const [uploadingCombine2, setUploadingCombine2] = useState(false);



  // Preview modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewType, setPreviewType] = useState('generated'); // 'generated' or 'example'
  const [exampleImages, setExampleImages] = useState([]);
  const [exampleImageInfo, setExampleImageInfo] = useState(null);
  const [autoOpenComparison, setAutoOpenComparison] = useState(false);



  // Refs for smooth scrolling
  const imageGenerationRef = useRef(null);
  const inputSectionRef = useRef(null);

  // Handle URL parameter for model selection
  useEffect(() => {
    const { model } = router.query;
    if (model && modelConfigurations[model]) {
      setSelectedModel(model);

      // Reset states when model changes from URL
      setSelectedItems([]);
      setSelectedStyles([]);

      // Set appropriate aspect ratio and outputs based on model
      if (model === 'hair-style' || model === 'combine-image' || model === 'home-designer') {
        setAspectRatio('match_input_image');
        setNumOutputs(1);
        setGeneratedImages([null]);
      } else if (model === 'restore-image' || model === 'gfp-restore' || model === 'background-removal' || model === 'remove-object') {
        setAspectRatio('');
        setNumOutputs(1);
        setGeneratedImages([null]);
      } else if (['text-removal', 'cartoonify', 'headshot', 'reimagine'].includes(model)) {
        setAspectRatio('1:1');
        setNumOutputs(1);
        setGeneratedImages([null]);
      } else {
        setAspectRatio('1:1');
        setNumOutputs(2);
        setGeneratedImages([null, null]);
      }

      // Reset model-specific states
      if (model !== 'hair-style') {
        setSelectedHairStyle('No change');
        setSelectedHairColor('No change');
        setSelectedGender('Male');
        setUploadedImage(null);
        setUploadedImageUrl(null);
        setUploadingHairImage(false);
      }

      if (model !== 'text-removal') {
        setTextRemovalImage(null);
        setTextRemovalImageUrl(null);
        setUploadingTextRemovalImage(false);
      }

      if (model !== 'cartoonify') {
        setCartoonifyImage(null);
        setCartoonifyImageUrl(null);
        setUploadingCartoonifyImage(false);
      }

      if (model !== 'headshot') {
        setHeadshotImage(null);
        setHeadshotImageUrl(null);
        setUploadingHeadshotImage(false);
        setSelectedHeadshotGender('None');
        setSelectedHeadshotBackground('Neutral');
      }

      if (model !== 'restore-image') {
        setRestoreImage(null);
        setRestoreImageUrl(null);
        setUploadingRestoreImage(false);
      }

      if (model !== 'gfp-restore') {
        setGfpRestoreImage(null);
        setGfpRestoreImageUrl(null);
        setUploadingGfpRestoreImage(false);
      }

      if (model !== 'home-designer') {
        setHomeDesignerImage(null);
        setHomeDesignerImageUrl(null);
        setUploadingHomeDesignerImage(false);
      }

      if (model !== 'background-removal') {
        setBackgroundRemovalImage(null);
        setBackgroundRemovalImageUrl(null);
        setUploadingBackgroundRemovalImage(false);
        setBackgroundRemovalStatus('Loading model...');
        setProcessingBackgroundRemoval(false);
      }

      if (model !== 'remove-object') {
        setRemoveObjectImage(null);
        setRemoveObjectImageUrl(null);
        setUploadingRemoveObjectImage(false);
        setRemoveObjectMask(null);
        setHasMaskDrawn(false);
      }

      if (model !== 'reimagine') {
        setReimagineImage(null);
        setReimagineImageUrl(null);
        setUploadingReimagineImage(false);
        setSelectedReimagineGender('None');
        setSelectedScenario('Random');
      }

      if (model !== 'combine-image') {
        setCombineImage1(null);
        setCombineImage2(null);
        setCombineImage1Url(null);
        setCombineImage2Url(null);
        setUploadingCombine1(false);
        setUploadingCombine2(false);
      }
    }
  }, [router.query]);

  // Smooth scroll to image generation section
  const scrollToImageGeneration = () => {
    if (imageGenerationRef.current) {
      imageGenerationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Smooth scroll to input section
  const scrollToInput = () => {
    if (inputSectionRef.current) {
      inputSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Dynamic aspect ratio options based on selected model
  const getAspectRatioOptions = () => {
    if (selectedModel === 'hair-style' || selectedModel === 'combine-image' || selectedModel === 'home-designer') {
      return currentConfig.aspectRatios.map(ratio => {
        const labels = {
          'match_input_image': 'Match Input Image',
          '1:1': '1:1 Square',
          '16:9': '16:9 Landscape',
          '9:16': '9:16 Vertical',
          '4:3': '4:3 Landscape',
          '3:4': '3:4 Portrait',
          '3:2': '3:2 Standard',
          '2:3': '2:3 Portrait',
          '4:5': '4:5 Portrait',
          '5:4': '5:4 Landscape',
          '21:9': '21:9 Ultrawide',
          '9:21': '9:21 Vertical Ultrawide',
          '2:1': '2:1 Wide',
          '1:2': '1:2 Tall'
        };
        return { value: ratio, label: labels[ratio] || ratio };
      });
    }

    return [
      { value: '1:1', label: '1:1 Square' },
      { value: '16:9', label: '16:9 Landscape' },
      { value: '21:9', label: '21:9 Ultrawide' },
      { value: '3:2', label: '3:2 Standard' },
      { value: '2:3', label: '2:3 Portrait' },
      { value: '4:5', label: '4:5 Portrait' },
      { value: '5:4', label: '5:4 Landscape' },
      { value: '3:4', label: '3:4 Portrait' },
      { value: '4:3', label: '4:3 Landscape' },
      { value: '9:16', label: '9:16 Vertical' },
      { value: '9:21', label: '9:21 Vertical Ultrawide' }
    ];
  };


  const handleModelChange = (event) => {
    const newModel = event.target.value;
    setSelectedModel(newModel);
    setSelectedItems([]);
    setSelectedStyles([]);
    router.push(`/ai-image-editor?model=${newModel}`);

    // Reset hair style specific states when switching models
    if (newModel !== 'hair-style') {
      setSelectedHairStyle('No change');
      setSelectedHairColor('No change');
      setSelectedGender('Male');
      setUploadedImage(null);
      setUploadedImageUrl(null);
      setUploadingHairImage(false);

    }

    // Reset text removal specific states when switching models
    if (newModel !== 'text-removal') {
      setTextRemovalImage(null);
      setTextRemovalImageUrl(null);
      setUploadingTextRemovalImage(false);
    }

    // Reset cartoonify specific states when switching models
    if (newModel !== 'cartoonify') {
      setCartoonifyImage(null);
      setCartoonifyImageUrl(null);
      setUploadingCartoonifyImage(false);
    }

    // Reset headshot specific states when switching models
    if (newModel !== 'headshot') {
      setHeadshotImage(null);
      setHeadshotImageUrl(null);
      setUploadingHeadshotImage(false);
      setSelectedHeadshotGender('None');
      setSelectedHeadshotBackground('Neutral');
    }

    // Reset restore image specific states when switching models
    if (newModel !== 'restore-image') {
      setRestoreImage(null);
      setRestoreImageUrl(null);
      setUploadingRestoreImage(false);
    }

    // Reset GFP restore specific states when switching models
    if (newModel !== 'gfp-restore') {
      setGfpRestoreImage(null);
      setGfpRestoreImageUrl(null);
      setUploadingGfpRestoreImage(false);
    }

    // Reset home designer specific states when switching models
    if (newModel !== 'home-designer') {
      setHomeDesignerImage(null);
      setHomeDesignerImageUrl(null);
      setUploadingHomeDesignerImage(false);
    }

    // Reset background removal specific states when switching models
    if (newModel !== 'background-removal') {
      setBackgroundRemovalImage(null);
      setBackgroundRemovalImageUrl(null);
      setUploadingBackgroundRemovalImage(false);
      setBackgroundRemovalStatus('Loading model...');
      setProcessingBackgroundRemoval(false);
    }

    // Reset remove object specific states when switching models
    if (newModel !== 'remove-object') {
      setRemoveObjectImage(null);
      setRemoveObjectImageUrl(null);
      setUploadingRemoveObjectImage(false);
      setRemoveObjectMask(null);
      setHasMaskDrawn(false);
    }

    // Reset reimagine specific states when switching models
    if (newModel !== 'reimagine') {
      setReimagineImage(null);
      setReimagineImageUrl(null);
      setUploadingReimagineImage(false);
      setSelectedReimagineGender('None');
      setSelectedScenario('Random');
    }

    // Reset combine image specific states when switching models
    if (newModel !== 'combine-image') {
      setCombineImage1(null);
      setCombineImage2(null);
      setCombineImage1Url(null);
      setCombineImage2Url(null);
      setUploadingCombine1(false);
      setUploadingCombine2(false);
    }

    // Reset aspect ratio to default for new model
    if (newModel === 'hair-style' || newModel === 'combine-image' || newModel === 'home-designer') {
      setAspectRatio('match_input_image');
    } else if (newModel === 'restore-image' || newModel === 'gfp-restore' || newModel === 'background-removal' || newModel === 'remove-object') {
      setAspectRatio('');
    } else if (newModel === 'text-removal' || newModel === 'cartoonify' || newModel === 'headshot' || newModel === 'reimagine') {
      setAspectRatio('1:1');
    } else {
      setAspectRatio('1:1');
    }

    // Set number of outputs based on model
    if (newModel === 'hair-style' || newModel === 'combine-image' || newModel === 'home-designer' || newModel === 'background-removal' || newModel === 'remove-object' || newModel === 'text-removal' || newModel === 'cartoonify' || newModel === 'headshot' || newModel === 'restore-image' || newModel === 'gfp-restore' || newModel === 'reimagine') {
      console.log(`Setting model ${newModel} to 1 output`);
      setNumOutputs(1);
      setGeneratedImages([null]);
    } else {
      console.log(`Setting model ${newModel} to 2 outputs`);
      setNumOutputs(2);
      setGeneratedImages([null, null]);
    }
  };

  // Helper function to upload image to R2 immediately
  const uploadImageToR2 = async (imageData, fileName) => {
    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          fileName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Upload failed');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar(`Upload failed: ${error.message}`, { variant: 'error' });
      return null;
    }
  };

  const generateFluxImages = async () => {
    if (!inputPrompt) {
      enqueueSnackbar('Please enter a prompt first', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('Setting up generatedImages array with numOutputs:', numOutputs);
    setGeneratedImages(Array(numOutputs).fill(null));

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      console.log('About to generate with:', {
        selectedModel,
        numOutputs,
        aspectRatio,
        promptLength: inputPrompt?.length
      });

      const config = {
        generate_flux_images: true,
        prompt: inputPrompt,
        aspect_ratio: aspectRatio,
        num_outputs: numOutputs
      };

      console.log('API Config being sent:', config);

      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to generate images');
      }

      const data = await response.json();
      console.log('Frontend received data:', data);
      console.log('Data type:', typeof data, 'Is array:', Array.isArray(data));

      // Handle new response format with historyId
      if (Array.isArray(data) && data.length > 0 && data[0] && data[0].imageUrl) {
        // New format: [{ imageUrl, historyId }, ...]
        const imageUrls = data.map(item => item.imageUrl);
        console.log('Extracted imageUrls:', imageUrls);
        console.log('Current numOutputs when setting images:', numOutputs);
        console.log('Setting generatedImages to:', imageUrls);
        setGeneratedImages(imageUrls);
        console.log('Images stored in history with IDs:', data.map(item => item.historyId));
      } else {
        // Fallback to old format
        console.log('Using fallback format, setting data directly:', data);
        console.log('Current numOutputs when setting fallback:', numOutputs);
        setGeneratedImages(data);
      }

      enqueueSnackbar('Images generated successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error generating images', { variant: 'error' });
      console.error('Error generating images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateHairStyleImages = async () => {
    if (!uploadedImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([null]); // Hair style model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Changing hair style...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            hair_style_change: true,
            image: uploadedImageUrl,
            hair_style: selectedHairStyle,
            hair_color: selectedHairColor,
            gender: selectedGender,
            aspect_ratio: aspectRatio
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to change hair style');
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
        console.log('Hair style image stored in history with ID:', data.historyId);
      } else {
        // Fallback to old format
        setGeneratedImages([data]);
      }

      enqueueSnackbar('Hair style changed successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error changing hair style', { variant: 'error' });
      console.error('Error changing hair style:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCombineImages = async () => {
    if (!combineImage1Url || !combineImage2Url) {
      enqueueSnackbar('Please upload both images first', { variant: 'warning' });
      return;
    }

    if (!inputPrompt.trim()) {
      enqueueSnackbar('Please enter a prompt for combining images', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([null]); // Combine image model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Combining images...', { variant: 'info' });

      // Send the stored URLs to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            combine_images: true,
            prompt: inputPrompt,
            input_image_1: combineImage1Url,
            input_image_2: combineImage2Url,
            aspect_ratio: aspectRatio
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to combine images');
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
        console.log('Combined image stored in history with ID:', data.historyId);
      } else {
        // Fallback to old format
        setGeneratedImages([data]);
      }

      enqueueSnackbar('Images combined successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error combining images', { variant: 'error' });
      console.error('Error combining images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTextRemovalImage = async () => {
    if (!textRemovalImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for text removal
    setGeneratedImages([null]); // Text removal model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Removing text from image...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            text_removal: true,
            input_image: textRemovalImageUrl,
            aspect_ratio: aspectRatio,
            output_format: 'png',
            safety_tolerance: 2
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to remove text from image');
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
        console.log('Text removal image stored in history with ID:', data.historyId);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Text removal model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected text removal response format:", data);
          enqueueSnackbar('Error processing text removal image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      console.log("Text removal response data:", data);
      enqueueSnackbar('Text removed successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error removing text from image', { variant: 'error' });
      console.error('Error removing text from image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCartoonifyImage = async () => {
    if (!cartoonifyImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for cartoonify
    setGeneratedImages([null]); // Cartoonify model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Cartoonifying image...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            cartoonify: true,
            input_image: cartoonifyImageUrl,
            aspect_ratio: aspectRatio,
            output_format: 'png',
            safety_tolerance: 2
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to cartoonify image');
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
        console.log('Cartoonify image stored in history with ID:', data.historyId);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Cartoonify model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected cartoonify response format:", data);
          enqueueSnackbar('Error processing cartoonified image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      console.log("Cartoonify response data:", data);
      enqueueSnackbar('Image cartoonified successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error cartoonifying image', { variant: 'error' });
      console.error('Error cartoonifying image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateHeadshotImage = async () => {
    if (!headshotImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for headshot
    setGeneratedImages([null]); // Headshot model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Generating professional headshot...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            headshot: true,
            input_image: headshotImageUrl,
            gender: selectedHeadshotGender.toLowerCase(),
            background: selectedHeadshotBackground.toLowerCase(),
            aspect_ratio: aspectRatio,
            output_format: 'png',
            safety_tolerance: 2
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to generate headshot');
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
        console.log('Headshot image stored in history with ID:', data.historyId);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Headshot model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected headshot response format:", data);
          enqueueSnackbar('Error processing headshot image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      console.log("Headshot response data:", data);
      enqueueSnackbar('Professional headshot generated successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error generating headshot', { variant: 'error' });
      console.error('Error generating headshot:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRestoreImage = async () => {
    if (!restoreImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for restore image
    setGeneratedImages([null]); // Restore image model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Restoring image...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            restore_image: true,
            input_image: restoreImageUrl,
            aspect_ratio: aspectRatio,
            output_format: 'png',
            safety_tolerance: 2
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to restore image');
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
        console.log('Restore image stored in history with ID:', data.historyId);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Restore image model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected restore image response format:", data);
          enqueueSnackbar('Error processing restored image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      console.log("Restore image response data:", data);
      enqueueSnackbar('Image restored successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error restoring image', { variant: 'error' });
      console.error('Error restoring image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateGfpRestoreImage = async () => {
    if (!gfpRestoreImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for GFP restore
    setGeneratedImages([null]); // GFP restore model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Restoring image with GFP-GAN (Free)...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            gfp_restore: true,
            input_image: gfpRestoreImageUrl
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to restore image with GFP-GAN');
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
        console.log('GFP restore image stored in history with ID:', data.historyId);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // GFP restore model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected GFP restore response format:", data);
          enqueueSnackbar('Error processing GFP restored image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      console.log("GFP restore response data:", data);
      enqueueSnackbar('Image restored successfully with GFP-GAN!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error restoring image with GFP-GAN', { variant: 'error' });
      console.error('Error restoring image with GFP-GAN:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateHomeDesignerImage = async () => {
    if (!homeDesignerImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    if (!inputPrompt.trim()) {
      enqueueSnackbar('Please enter a design prompt', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for home designer
    setGeneratedImages([null]); // Home designer model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Designing your home interior...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            home_designer: true,
            input_image: homeDesignerImageUrl,
            prompt: inputPrompt,
            aspect_ratio: aspectRatio
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to generate home design');
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
        console.log('Home designer image stored in history with ID:', data.historyId);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Home designer model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected home designer response format:", data);
          enqueueSnackbar('Error processing home design', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      console.log("Home designer response data:", data);
      enqueueSnackbar('Home design generated successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error generating home design', { variant: 'error' });
      console.error('Error generating home design:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBackgroundRemovalImage = async () => {
    if (!backgroundRemovalImage) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    if (backgroundRemovalStatus !== 'Ready') {
      enqueueSnackbar('Background removal model is still loading...', { variant: 'warning' });
      return;
    }

    // The processing will be handled by the BackgroundRemovalProcessor component
    // Just trigger it by setting the processing state
    setProcessingBackgroundRemoval(true);
    setIsLoading(true);
    setError(null);
    setNumOutputs(1);
    setGeneratedImages([null]);

    // Smooth scroll to image generation section
    scrollToImageGeneration();
  };

  // Handle background removal callbacks
  const handleBackgroundRemovalStart = () => {
    enqueueSnackbar('Analyzing image...', { variant: 'info' });
  };

  const handleBackgroundRemovalComplete = (resultImageUrl) => {
    setGeneratedImages([resultImageUrl]);
    setIsLoading(false);
    setProcessingBackgroundRemoval(false);
    enqueueSnackbar('Background removed successfully!', { variant: 'success' });
  };

  const handleBackgroundRemovalError = (error) => {
    setIsLoading(false);
    setProcessingBackgroundRemoval(false);
    enqueueSnackbar(error || 'Error removing background', { variant: 'error' });
  };

  const handleBackgroundRemovalStatusChange = (status) => {
    setBackgroundRemovalStatus(status);
  };

  const generateRemoveObjectImage = async () => {
    if (!removeObjectImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    if (!removeObjectMask || !hasMaskDrawn) {
      enqueueSnackbar('Please draw on the image to mark objects for removal', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for remove object
    setGeneratedImages([null]); // Remove object model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Removing objects...', { variant: 'info' });

      // Upload mask to R2 first
      const maskUrl = await uploadImageToR2(removeObjectMask, 'remove-object-mask.png');
      if (!maskUrl) {
        throw new Error('Failed to upload mask image');
      }

      // Send the stored URLs to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            remove_object: true,
            input_image: removeObjectImageUrl,
            mask_image: maskUrl
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to remove objects');
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
        console.log('Remove object image stored in history with ID:', data.historyId);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Remove object model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected remove object response format:", data);
          enqueueSnackbar('Error processing object removal', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      console.log("Remove object response data:", data);
      enqueueSnackbar('Objects removed successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error removing objects', { variant: 'error' });
      console.error('Error removing objects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mask creation from the ObjectRemovalMaskEditor
  const handleMaskCreated = (maskDataUrl) => {
    setRemoveObjectMask(maskDataUrl);
    setHasMaskDrawn(true);
  };

  const generateReimagineImage = async () => {
    if (!reimagineImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for reimagine
    setGeneratedImages([null]); // ReImagine model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Generating impossible scenario...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            reimagine: true,
            input_image: reimagineImageUrl,
            gender: selectedReimagineGender.toLowerCase(),
            aspect_ratio: aspectRatio,
            output_format: "png",
            safety_tolerance: 2,
            impossible_scenario: selectedScenario
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to generate impossible scenario');
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
        console.log('Reimagine image stored in history with ID:', data.historyId);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // ReImagine model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected reimagine response format:", data);
          enqueueSnackbar('Error processing reimagined image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      console.log("ReImagine response data:", data);
      enqueueSnackbar('Impossible scenario generated successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Error generating impossible scenario', { variant: 'error' });
      console.error('Error generating impossible scenario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (inputPrompt.trim()) {
        if (selectedModel === 'combine-image') {
          generateCombineImages();
        } else {
          generateFluxImages();
        }
      }
    }
  };



  const handleChipClick = (option) => {
    if (currentConfig.type === 'prompts') {
      // For text prompts, just set the input
      setInputPrompt(option);
    } else {
      // For styles, handle selection with chips
      if (selectedItems.includes(option)) {
        setSelectedItems(selectedItems.filter(item => item !== option));
      } else {
        setSelectedItems([...selectedItems, option]);
      }
    }
  };

  const handleChipDelete = (itemToDelete) => {
    setSelectedItems(selectedItems.filter(item => item !== itemToDelete));
  };

  const handleStyleSelect = (style) => {
    const isSelected = selectedStyles.some(s => s.id === style.id);
    if (isSelected) {
      setSelectedStyles(selectedStyles.filter(s => s.id !== style.id));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e, index) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImages = [...generatedImages];
        newImages[index] = event.target.result;
        setGeneratedImages(newImages);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [generatedImages]);



  const removeImage = (index) => {
    const newImages = [...generatedImages];
    newImages[index] = null;
    setGeneratedImages(newImages);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.MuiBox-root')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Log when generatedImages changes
  useEffect(() => {
    console.log("generatedImages state updated:", generatedImages);
    console.log("Valid images count:", generatedImages.filter(img => img !== null).length);
    generatedImages.forEach((img, index) => {
      if (img) {
        console.log(`Image ${index + 1}:`, img.substring(0, 100) + '...');
      }
    });
  }, [generatedImages]);



  const currentConfig = modelConfigurations[selectedModel];

  // Get display name for model
  const getModelDisplayName = (model) => {
    const names = {
      'generate-image': 'AI Image Generator',
      'hair-style': 'Hair Style Changer',
      'headshot': 'Professional Headshot',
      'cartoonify': 'Cartoonify',
      'restore-image': 'Image Restoration',
      'text-removal': 'Text/Watermark Removal',
      'reimagine': 'ReImagine Scenarios',
      'combine-image': 'Image Combiner'
    };
    return names[model] || model;
  };

  // Utility function to generate intelligent filename
  const generateFileName = (model, prompt = '', index = 0) => {
    const config = modelConfigurations[model];
    const usesPrompts = config?.type === 'prompts';

    // Generate random string
    const randomString = Math.random().toString(36).substring(2, 8);

    if (usesPrompts && prompt && prompt.trim()) {
      // Clean and format prompt for filename
      const cleanPrompt = prompt
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 50); // Limit length to 50 characters

      return `${cleanPrompt}-${randomString}.jpg`;
    } else if (model === 'hair-style' && selectedHairStyle && selectedHairStyle !== 'No change') {
      // Use selected hair style for hair-style model
      const cleanStyle = selectedHairStyle
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 30); // Limit length to 30 characters

      return `hair-style-${cleanStyle}-${randomString}.jpg`;
    } else if (model === 'reimagine' && selectedScenario && selectedScenario !== 'Random') {
      // Use selected scenario for reimagine model
      const cleanScenario = selectedScenario
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 40); // Limit length to 40 characters

      return `reimagine-${cleanScenario}-${randomString}.jpg`;
    } else {
      // Use model name with random string
      const modelName = getModelDisplayName(model)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      return `${modelName}-${randomString}.jpg`;
    }
  };

  const handleDownload = (imageUrl, index) => {
    // Generate intelligent filename
    const filename = generateFileName(selectedModel, inputPrompt, index);

    // For base64 images
    if (imageUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For regular URLs
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
    }
  };

  const getAllStyleItems = () => {
    if (!currentConfig) return [];
    console.log(currentConfig);
    if (selectedGender === "Male") {
      return currentConfig.hairStylesMale || [];
    } else if (selectedGender === "Female") {
      return currentConfig.hairStylesFemale || [];
    }
    return [];
  };

  // Helper function to generate model configuration for generated images
  const generateGeneratedImageConfig = () => {
    const configParts = [];

    switch (selectedModel) {
      case 'hair-style':
        if (selectedHairStyle && selectedHairStyle !== 'No change') {
          configParts.push(`${selectedHairStyle} hairstyle`);
        }
        if (selectedHairColor && selectedHairColor !== 'No change') {
          configParts.push(`${selectedHairColor.toLowerCase()} hair color`);
        }
        if (selectedGender && selectedGender !== 'None') {
          configParts.push(`${selectedGender.toLowerCase()} styling`);
        }
        break;

      case 'headshot':
        if (selectedHeadshotBackground && selectedHeadshotBackground !== 'None') {
          configParts.push(`${selectedHeadshotBackground.toLowerCase()} background`);
        }
        if (selectedHeadshotGender && selectedHeadshotGender !== 'None') {
          configParts.push(`${selectedHeadshotGender.toLowerCase()} professional headshot`);
        }
        break;

      case 'reimagine':
        if (selectedScenario && selectedScenario !== 'Random') {
          configParts.push(selectedScenario);
        }
        if (selectedReimagineGender && selectedReimagineGender !== 'None') {
          configParts.push(`${selectedReimagineGender.toLowerCase()} scenario`);
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
        configParts.push('GFP-GAN image restoration (Free)');
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

      default:
        break;
    }

    // Add aspect ratio if available
    if (aspectRatio) {
      configParts.push(`${aspectRatio} aspect ratio`);
    }

    return configParts.length > 0 ? configParts.join(', ') : null;
  };

  const handlePreview = (imageUrl, imageIndex = 0) => {
    // Filter out null images to get valid images array
    const validImages = generatedImages.filter(img => img !== null);
    // Find the index in the valid images array
    const validIndex = validImages.findIndex(img => img === imageUrl);
    setCurrentImageIndex(validIndex >= 0 ? validIndex : 0);
    setPreviewImage(imageUrl);
    setPreviewType('generated');
    setExampleImages([]);

    // Generate model configuration for when there's no prompt
    const modelConfigText = !inputPrompt || !inputPrompt.trim()
      ? generateGeneratedImageConfig()
      : null;

    setExampleImageInfo({
      title: `Generated Image ${validIndex + 1}`,
      prompt: inputPrompt || null,
      modelConfig: modelConfigText,
      model: selectedModel,
      createdAt: new Date().toISOString(),
      resolution: 'High Quality',
      format: 'JPEG',
      type: 'generated'
    });
    setAutoOpenComparison(false);
    setPreviewOpen(true);
  };

  const handleComparePreview = (imageUrl, imageIndex = 0) => {
    // Open preview modal and automatically activate comparison mode
    const validImages = generatedImages.filter(img => img !== null);
    const validIndex = validImages.findIndex(img => img === imageUrl);
    setCurrentImageIndex(validIndex >= 0 ? validIndex : 0);
    setPreviewImage(imageUrl);
    setPreviewType('generated');
    setExampleImages([]);

    // Generate model configuration for when there's no prompt
    const modelConfigText = !inputPrompt || !inputPrompt.trim()
      ? generateGeneratedImageConfig()
      : null;

    setExampleImageInfo({
      // title: `Generated Image ${validIndex + 1}`,
      prompt: inputPrompt || null,
      modelConfig: modelConfigText,
      model: selectedModel,
      createdAt: new Date().toISOString(),
      resolution: 'High Quality',
      format: 'JPEG',
      type: 'generated'
    });
    setAutoOpenComparison(true);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewImage(null);
    setCurrentImageIndex(0);
    setPreviewType('generated');
    setExampleImages([]);
    setExampleImageInfo(null);
    setAutoOpenComparison(false);
  };

  // Handle image navigation in preview
  const handleImageChange = (newIndex) => {
    setCurrentImageIndex(newIndex);

    if (previewType === 'generated') {
      // Update previewImage based on the new index for generated images
      const validImages = generatedImages.filter(img => img !== null);
      if (validImages[newIndex]) {
        setPreviewImage(validImages[newIndex]);
      }
    } else if (previewType === 'example') {
      // Update previewImage based on the new index for example images
      if (exampleImages[newIndex]) {
        setPreviewImage(exampleImages[newIndex].url);
        setExampleImageInfo({
          title: exampleImages[newIndex].title,
          prompt: exampleImages[newIndex].prompt,
          model: selectedModel,
          // created: 'Example Image',
          resolution: 'High Quality',
          format: 'JPEG',
          type: 'example'
        });
      }
    }
  };

  // Handle example image click from masonry
  const handleExampleImageClick = (imageData) => {
    setPreviewImage(imageData.url);
    setCurrentImageIndex(imageData.index);
    setPreviewType('example');
    setExampleImages(imageData.images);
    setExampleImageInfo(imageData.imageInfo);
    setPreviewOpen(true);
  };

  // Handle prompt use from masonry
  const handlePromptUse = (prompt) => {
    setInputPrompt(prompt);
    enqueueSnackbar('Prompt added! Scrolling to input field...', { variant: 'success' });

    // Smooth scroll to input section after a short delay to let the snackbar appear
    setTimeout(() => {
      scrollToInput();

      // Focus the input field after scrolling for better UX
      const inputElement = inputSectionRef.current?.querySelector('textarea');
      if (inputElement) {
        setTimeout(() => {
          inputElement.focus();
          inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
        }, 500);
      }
    }, 300);
  };

  // Image comparison functions
  const canCompareImages = () => {
    // Check if we have images available for comparison
    if (selectedModel === 'hair-style' && uploadedImage && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'text-removal' && textRemovalImage && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'cartoonify' && cartoonifyImage && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'headshot' && headshotImage && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'restore-image' && restoreImage && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'gfp-restore' && gfpRestoreImage && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'home-designer' && homeDesignerImage && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'background-removal' && backgroundRemovalImage && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'remove-object' && removeObjectImage && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'reimagine' && reimagineImage && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'combine-image' && combineImage1 && generatedImages[0]) {
      return true;
    }
    // For generate-image model, check if we have at least 2 generated images
    if (selectedModel === 'generate-image' && generatedImages.filter(img => img !== null).length >= 2) {
      return true;
    }
    return false;
  };

  const getComparisonLabels = () => {
    if (selectedModel === 'hair-style') {
      return { before: 'Original', after: 'New Hair Style' };
    } else if (selectedModel === 'text-removal') {
      return { before: 'With Text', after: 'Text Removed' };
    } else if (selectedModel === 'cartoonify') {
      return { before: 'Original', after: 'Cartoonified' };
    } else if (selectedModel === 'headshot') {
      return { before: 'Original', after: 'Professional Headshot' };
    } else if (selectedModel === 'restore-image') {
      return { before: 'Original', after: 'Restored' };
    } else if (selectedModel === 'gfp-restore') {
      return { before: 'Original', after: 'GFP Restored' };
    } else if (selectedModel === 'home-designer') {
      return { before: 'Original Room', after: 'Redesigned Room' };
    } else if (selectedModel === 'background-removal') {
      return { before: 'With Background', after: 'Background Removed' };
    } else if (selectedModel === 'remove-object') {
      return { before: 'With Objects', after: 'Objects Removed' };
    } else if (selectedModel === 'reimagine') {
      return { before: 'Original', after: 'Reimagined' };
    } else if (selectedModel === 'combine-image') {
      return { before: 'Input Image', after: 'Combined Result' };
    } else if (selectedModel === 'generate-image') {
      return { before: 'Generated Image 1', after: 'Generated Image 2' };
    }
    return { before: 'Before', after: 'After' };
  };

  // Helper function to generate meaningful prompt/description based on model configuration
  const generateModelPrompt = (model, currentState, userPrompt) => {
    // If user provided a prompt, use it
    if (userPrompt && userPrompt.trim()) {
      return userPrompt.trim();
    }

    // Generate prompt based on model configuration
    switch (model) {
      case 'hair-style':
        const hairParts = [];
        if (currentState.selectedHairStyle && currentState.selectedHairStyle !== 'No change') {
          hairParts.push(`${currentState.selectedHairStyle} hairstyle`);
        }
        if (currentState.selectedHairColor && currentState.selectedHairColor !== 'No change') {
          hairParts.push(`${currentState.selectedHairColor.toLowerCase()} hair color`);
        }
        if (currentState.selectedGender && currentState.selectedGender !== 'None') {
          hairParts.push(`${currentState.selectedGender.toLowerCase()} styling`);
        }
        return hairParts.length > 0 ? hairParts.join(', ') : 'Hair style transformation';

      case 'headshot':
        const headshotParts = [];
        if (currentState.selectedHeadshotBackground && currentState.selectedHeadshotBackground !== 'None') {
          headshotParts.push(`${currentState.selectedHeadshotBackground.toLowerCase()} background`);
        }
        if (currentState.selectedHeadshotGender && currentState.selectedHeadshotGender !== 'None') {
          headshotParts.push(`${currentState.selectedHeadshotGender.toLowerCase()} professional headshot`);
        }
        return headshotParts.length > 0 ? headshotParts.join(', ') : 'Professional headshot';

      case 'reimagine':
        const reimagineParts = [];
        if (currentState.selectedScenario && currentState.selectedScenario !== 'Random') {
          reimagineParts.push(currentState.selectedScenario);
        }
        if (currentState.selectedReimagineGender && currentState.selectedReimagineGender !== 'None') {
          reimagineParts.push(`${currentState.selectedReimagineGender.toLowerCase()} scenario`);
        }
        return reimagineParts.length > 0 ? reimagineParts.join(', ') : 'Reimagined scenario';

      case 'text-removal':
        return 'Text and watermark removal';

      case 'cartoonify':
        return 'Cartoon style transformation';

      case 'restore-image':
        return 'Image restoration and enhancement';

      case 'combine-image':
        return userPrompt && userPrompt.trim() ? userPrompt.trim() : 'Combined image creation';

      case 'generate-image':
        return userPrompt && userPrompt.trim() ? userPrompt.trim() : 'AI generated image';

      default:
        return 'AI image transformation';
    }
  };

  // Handle image publishing
  const handlePublishImage = async ({ imageUrl, imageIndex, title, description }) => {
    try {
      // Get current state for input images and model parameters
      const currentState = {
        uploadedImage,
        combineImage1,
        combineImage2,
        textRemovalImage,
        cartoonifyImage,
        headshotImage,
        restoreImage,
        gfpRestoreImage,
        homeDesignerImage,
        backgroundRemovalImage,
        removeObjectImage,
        removeObjectMask,
        reimagineImage,
        selectedHairStyle,
        selectedHairColor,
        selectedGender,
        selectedHeadshotGender,
        selectedHeadshotBackground,
        selectedReimagineGender,
        selectedScenario,
        aspectRatio
      };

      // Collect input images based on model type
      const inputImages = getModelInputImages(selectedModel, currentState);

      // Collect model parameters
      const modelParams = getModelParameters(selectedModel, currentState);

      // Generate meaningful prompt based on model configuration
      const generatedPrompt = generateModelPrompt(selectedModel, currentState, inputPrompt);

      console.log('Publishing image:', {
        model: selectedModel,
        title,
        prompt: generatedPrompt,
        inputImages: inputImages.length,
        modelParams
      });

      // Publish the image
      const response = await fetch('/api/images/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outputImage: imageUrl,
          inputImages,
          model: selectedModel,
          title,
          prompt: generatedPrompt,
          modelParams,
          aspectRatio
        })
      });

      if (response.ok) {
        const result = await response.json();
        enqueueSnackbar('🎉 Image published to community successfully!', { variant: 'success' });
        console.log('Published image:', result.image);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish image');
      }

    } catch (error) {
      console.error('Publish error:', error);
      enqueueSnackbar(`Failed to publish image: ${error.message}`, { variant: 'error' });
    }
  };
  
  const imageStyle = {
    borderRadius: '5px',
};


  return (
    <>
      <Head>
        <title>AI Image Editor | PicFix.AI</title>
        <meta name="description" content="Advanced AI-powered image editing tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <StyledPaper elevation={0}>
        <MenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </MenuButton>

        <Box sx={{ display: 'flex', height: '100%', width: '100%', position: 'relative' }}>
          {/* Overlay for mobile */}
          {mobileMenuOpen && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 999,
                display: { xs: 'block', md: 'none' },
              }}
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Right Side Panel */}
          <SidePanel className={mobileMenuOpen ? 'open' : ''}>

            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
              <Link href="/">
                <Image style={imageStyle} src="/assets/PicFixAILogo.jpg" alt="Logo" width={210} height={40} />
              </Link>
            </Box>
            {/* Model Selection */}
            <FormControl fullWidth variant="outlined">
              <InputLabel sx={{ fontSize: '14px', fontWeight: 400, }}>Select Model</InputLabel>
              <Select
                value={selectedModel}
                onChange={handleModelChange}
                label="Select Model"
                sx={{
                  borderRadius: 2,
                  '& .MuiSelect-select': {
                    padding: '.5rem',
                    paddingLeft: '1rem',
                    fontSize: '12px',
                    fontWeight: 400,
                  },


                }}
              >
                {Object.entries(modelConfigurations).map(([key, config]) => (
                  <MenuItem key={key} value={key} sx={{ fontSize: '12px', fontWeight: 400, }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      {config.type != 'gfp-restore' && config.type != 'background-removal' && <FaCrown
                        style={{
                          fontSize: '16px',
                          color: '#FFD700',
                          filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))'
                        }}
                      />}
                      {config.type == 'gfp-restore' && <FaGift
                        style={{
                          fontSize: '16px',
                          color: 'green',
                          // filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.5))'
                        }}
                      />}
                      {config.type == 'background-removal' && <FaGift
                        style={{
                          fontSize: '16px',
                          color: 'green',
                          // filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.5))'
                        }}
                      />}
                      <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 400 }}>
                        {config.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedModel !== 'restore-image' && selectedModel !== 'gfp-restore' && selectedModel !== 'background-removal' && selectedModel !== 'remove-object' && (
              <FormControl fullWidth variant="outlined">
                <InputLabel>Aspect Ratio</InputLabel>
                <Select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  label="Aspect Ratio"
                  sx={{
                    borderRadius: 2,
                    '& .MuiSelect-select': {
                      padding: '.5rem',
                      paddingLeft: '1rem',
                      fontSize: '2px',
                      fontWeight: 400,
                    },
                  }}
                >
                  {getAspectRatioOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: alpha(theme.palette.grey[300], 0.3),
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: option.value === '1:1' ? 16 : option.value === '16:9' ? 20 : option.value === '9:16' ? 10 :
                                option.value === '2:3' ? 12 : option.value === '3:4' ? 14 : option.value === '1:2' ? 10 :
                                  option.value === '2:1' ? 20 : option.value === '4:5' ? 16 : option.value === '3:2' ? 18 : 16,
                              height: option.value === '1:1' ? 16 : option.value === '16:9' ? 11 : option.value === '9:16' ? 18 :
                                option.value === '2:3' ? 18 : option.value === '3:4' ? 18 : option.value === '1:2' ? 20 :
                                  option.value === '2:1' ? 10 : option.value === '4:5' ? 20 : option.value === '3:2' ? 12 : 12,
                              backgroundColor: theme.palette.primary.main,
                              borderRadius: 0.5,
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 500, }}>{option.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Hair Style Specific Sidebar Controls */}
            {selectedModel === 'hair-style' && (
              <>
                {/* Hair Color Selection */}
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Hair Color</InputLabel>
                  <Select
                    value={selectedHairColor}
                    onChange={(e) => setSelectedHairColor(e.target.value)}
                    label="Hair Color"
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        padding: '.5rem',
                        paddingLeft: '1rem',
                        fontSize: '12px',
                        fontWeight: 400,
                      },
                    }}
                  >
                    {currentConfig.hairColors.map((color, index) => (
                      <MenuItem key={index} value={color} sx={{ fontSize: '12px', fontWeight: 400, }}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Gender Selection */}
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    label="Gender"
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        padding: '.5rem',
                        paddingLeft: '1rem',
                        fontSize: '12px',
                        fontWeight: 400,
                      },
                    }}
                  >
                    {currentConfig.genders.map((gender, index) => (
                      <MenuItem key={index} value={gender} sx={{ fontSize: '12px', fontWeight: 400, }}>
                        {gender}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            {/* Headshot Specific Sidebar Controls */}
            {selectedModel === 'headshot' && (
              <>
                {/* Gender Selection */}
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={selectedHeadshotGender}
                    onChange={(e) => setSelectedHeadshotGender(e.target.value)}
                    label="Gender"
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        padding: '.5rem',
                        paddingLeft: '1rem',
                        fontSize: '12px',
                        fontWeight: 400,
                      },
                    }}
                  >
                    {currentConfig.genders.map((gender, index) => (
                      <MenuItem key={index} value={gender} sx={{ fontSize: '12px', fontWeight: 400, }}>
                        {gender}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Background Selection */}
                <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                  <InputLabel>Background</InputLabel>
                  <Select
                    value={selectedHeadshotBackground}
                    onChange={(e) => setSelectedHeadshotBackground(e.target.value)}
                    label="Background"
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        padding: '.5rem',
                        paddingLeft: '1rem',
                        fontSize: '12px',
                        fontWeight: 400,
                      },
                    }}
                  >
                    {currentConfig.backgrounds.map((background, index) => (
                      <MenuItem key={index} value={background} sx={{ fontSize: '12px', fontWeight: 400, }}>
                        {background}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* ReImagine Specific Sidebar Controls */}
            {selectedModel === 'reimagine' && (
              <>
                {/* Gender Selection */}
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={selectedReimagineGender}
                    onChange={(e) => setSelectedReimagineGender(e.target.value)}
                    label="Gender"
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        padding: '.5rem',
                        paddingLeft: '1rem',
                        fontSize: '12px',
                        fontWeight: 400,
                      },
                    }}
                  >
                    {currentConfig.genders.map((gender, index) => (
                      <MenuItem key={index} value={gender} sx={{ fontSize: '12px', fontWeight: 400, }}>
                        {gender}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                  <InputLabel>Reimagine Yourself</InputLabel>
                  <Select
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario(e.target.value)}
                    label="Reimagine Yourself"
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        padding: '.5rem',
                        paddingLeft: '1rem',
                        fontSize: '12px',
                        fontWeight: 400,
                      },
                    }}
                  >
                    {currentConfig.scenarios.map((scenario, index) => (
                      <MenuItem key={index} value={scenario} sx={{ fontSize: '12px', fontWeight: 400, }}>
                        {scenario}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {selectedModel !== 'hair-style' && selectedModel !== 'combine-image' && selectedModel !== 'home-designer' && selectedModel !== 'background-removal' && selectedModel !== 'remove-object' && selectedModel !== 'text-removal' && selectedModel !== 'cartoonify' && selectedModel !== 'headshot' && selectedModel !== 'restore-image' && selectedModel !== 'gfp-restore' && selectedModel !== 're-imagine' && (
              <Box sx={{ mt: -1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '12px', mb: .5 }}>
                  Number of Outputs
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '& .MuiSelect-select': {
                      padding: '.5rem',
                      paddingLeft: '1rem',
                    },
                  }}
                >
                  <IconButton
                    onClick={() => {
                      if (numOutputs > 1) {
                        setNumOutputs(prev => prev - 1);
                        setGeneratedImages(Array(numOutputs - 1).fill(null));
                      }
                    }}
                    disabled={numOutputs <= 1}
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      },
                      '&.Mui-disabled': {
                        color: alpha(theme.palette.text.secondary, 0.3),
                      }
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      px: 2,
                      minWidth: '60px',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      color: theme.palette.text.primary,
                    }}
                  >
                    {numOutputs}
                  </Box>
                  <IconButton
                    onClick={() => {
                      if (numOutputs < 4) {
                        setNumOutputs(prev => prev + 1);
                        setGeneratedImages(Array(numOutputs + 1).fill(null));
                      }
                    }}
                    disabled={numOutputs >= 4}
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      },
                      '&.Mui-disabled': {
                        color: alpha(theme.palette.text.secondary, 0.3),
                      }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Additional Settings */}
            <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2, textAlign: 'center' }}>
                Credits remaining: {context.creditPoints || 0}
              </Typography>


              <Button
                fullWidth
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                disabled={isLoading ||
                  (selectedModel === 'hair-style' ? !uploadedImageUrl :
                    selectedModel === 'text-removal' ? !textRemovalImageUrl :
                      selectedModel === 'cartoonify' ? !cartoonifyImageUrl :
                        selectedModel === 'headshot' ? !headshotImageUrl :
                          selectedModel === 'restore-image' ? !restoreImageUrl :
                            selectedModel === 'gfp-restore' ? !gfpRestoreImageUrl :
                              selectedModel === 'home-designer' ? (!homeDesignerImageUrl || !inputPrompt.trim()) :
                                selectedModel === 'background-removal' ? (!backgroundRemovalImage || backgroundRemovalStatus !== 'Ready') :
                                  selectedModel === 'remove-object' ? (!removeObjectImageUrl || !hasMaskDrawn) :
                                    selectedModel === 'reimagine' ? !reimagineImageUrl :
                                      selectedModel === 'combine-image' ? (!combineImage1Url || !combineImage2Url || !inputPrompt.trim()) :
                                        !inputPrompt.trim())}
                onClick={selectedModel === 'hair-style' ? generateHairStyleImages :
                  selectedModel === 'text-removal' ? generateTextRemovalImage :
                    selectedModel === 'cartoonify' ? generateCartoonifyImage :
                      selectedModel === 'headshot' ? generateHeadshotImage :
                        selectedModel === 'restore-image' ? generateRestoreImage :
                          selectedModel === 'gfp-restore' ? generateGfpRestoreImage :
                            selectedModel === 'home-designer' ? generateHomeDesignerImage :
                              selectedModel === 'background-removal' ? generateBackgroundRemovalImage :
                                selectedModel === 'remove-object' ? generateRemoveObjectImage :
                                  selectedModel === 'reimagine' ? generateReimagineImage :
                                    selectedModel === 'combine-image' ? generateCombineImages :
                                      generateFluxImages}
                sx={{
                  borderRadius: 3,
                  py: 1,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '.8rem',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 30px rgba(102, 126, 234, 0.4)',
                  },
                  '&.Mui-disabled': {
                    background: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? 'Processing...' :
                  selectedModel === 'hair-style' ? 'Change Hair Style' :
                    selectedModel === 'text-removal' ? 'Remove Watermark' :
                      selectedModel === 'cartoonify' ? 'Cartoonify Image' :
                        selectedModel === 'headshot' ? 'Generate Headshot' :
                          selectedModel === 'restore-image' ? 'Restore Image' :
                            selectedModel === 'gfp-restore' ? 'Restore Image (Free)' :
                              selectedModel === 'home-designer' ? 'Design Interior' :
                                selectedModel === 'background-removal' ? (backgroundRemovalStatus === 'Ready' ? 'Remove Background' : backgroundRemovalStatus) :
                                  selectedModel === 'remove-object' ? 'Remove Objects' :
                                    selectedModel === 'reimagine' ? 'Reimagine Yourself' :
                                      selectedModel === 'combine-image' ? 'Combine Images' :
                                        'Generate Image'}
              </Button>
            </Box>
          </SidePanel>

          {/* Main Editor Area */}
          <MainEditor>
            {/* Hair Style Scrollable Strip for Hair Style Model */}
            {selectedModel === 'hair-style' ? (
              <Box>
                <Box
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {/* Hair Style Strip */}
                  {(selectedGender === "Male" || selectedGender === "Female") ? (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        overflowX: 'auto',
                        pb: 1,
                        px: 1,
                        scrollBehavior: 'smooth',
                        '&::-webkit-scrollbar': {
                          height: 8,
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: alpha(theme.palette.grey[300], 0.3),
                          borderRadius: 4,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.6),
                          borderRadius: 4,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.8),
                          },
                        },
                        // For Firefox
                        scrollbarWidth: 'thin',
                        scrollbarColor: `${alpha(theme.palette.primary.main, 0.6)} ${alpha(theme.palette.grey[300], 0.3)}`,
                      }}
                    >
                      {getAllStyleItems().map((style) => (
                        <AppStyleCard
                          key={style.id}
                          onClick={() => setSelectedHairStyle(style.name)}
                          sx={{
                            minWidth: 80,
                            flexShrink: 0,
                            userSelect: 'none', // Prevent text selection when dragging
                          }}
                        >
                          <AppStyleIcon className={selectedHairStyle === style.name ? 'selected' : ''}>
                            <img
                              src={style.image}
                              alt={style.name}
                              height={100}
                              width={100}
                              draggable={false} // Prevent image drag
                            />
                          </AppStyleIcon>
                          <AppStyleLabel>{style.name}</AppStyleLabel>
                        </AppStyleCard>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        py: 4,
                        px: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                      }}
                    >
                      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                        Please select a gender from the sidebar to view available hair styles
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              /* Styles Grid for other models */
              <>
                {currentConfig.type === 'styles' ? (
                  <Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: 3,
                        padding: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        borderRadius: 2,
                      }}
                    >
                      {currentConfig.styles.map((style) => (
                        <AppStyleCard key={style.id} onClick={() => handleStyleSelect(style)}>
                          <AppStyleIcon className={selectedStyles.some(s => s.id === style.id) ? 'selected' : ''}>
                            <img src={style.image} alt={style.name} />
                          </AppStyleIcon>
                          <AppStyleLabel>{style.name}</AppStyleLabel>
                        </AppStyleCard>
                      ))}
                    </Box>
                  </Box>
                ) : currentConfig.type === 'text-removal' || currentConfig.type === 'cartoonify' || currentConfig.type === 'headshot' || currentConfig.type === 'restore-image' || currentConfig.type === 'reimagine' ? (
                  // Don't show anything for text-removal, cartoonify, headshot, restore-image, or reimagine type
                  null
                ) : (
                  <Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        padding: 1,
                        borderRadius: 2,
                      }}
                    >
                      {currentConfig.options && currentConfig.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={selectedItems.includes(option) ? "contained" : "outlined"}
                          onClick={() => handleChipClick(option)}
                          sx={{
                            borderRadius: '50px',
                            textTransform: 'none',
                            padding: '4px 14px',
                            fontSize: '12px',
                            fontWeight: 400,
                            borderColor: selectedItems.includes(option)
                              ? 'transparent'
                              : alpha(theme.palette.divider, 0.5),
                            backgroundColor: selectedItems.includes(option)
                              ? theme.palette.primary.main
                              : 'transparent',
                            color: selectedItems.includes(option)
                              ? 'white'
                              : theme.palette.text.primary,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              backgroundColor: selectedItems.includes(option)
                                ? theme.palette.primary.dark
                                : alpha(theme.palette.primary.main, 0.04),
                            },
                            minWidth: 'auto',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {option}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}

            {/* Input Section - Only show for models that need prompts */}
            {selectedModel !== 'hair-style' && selectedModel !== 'text-removal' && selectedModel !== 'cartoonify' && selectedModel !== 'headshot' && selectedModel !== 'restore-image' && selectedModel !== 'gfp-restore' && selectedModel !== 'background-removal' && selectedModel !== 'remove-object' && selectedModel !== 'reimagine' && (
              <Box ref={inputSectionRef} sx={{ position: 'relative' }}>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Enter your creative prompt here..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ alignSelf: 'flex-end', mb: 1 }}>
                        {selectedModel !== 'generate-image' && (
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="prompt-image-upload"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const emptyIndex = generatedImages.findIndex(img => img === null);
                                  if (emptyIndex !== -1) {
                                    const newImages = [...generatedImages];
                                    newImages[emptyIndex] = event.target.result;
                                    setGeneratedImages(newImages);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        )}
                        <IconButton
                          onClick={selectedModel === 'hair-style' ? generateHairStyleImages :
                            selectedModel === 'text-removal' ? generateTextRemovalImage :
                              selectedModel === 'home-designer' ? generateHomeDesignerImage :
                                selectedModel === 'background-removal' ? generateBackgroundRemovalImage :
                                  selectedModel === 'remove-object' ? generateRemoveObjectImage :
                                    selectedModel === 'combine-image' ? generateCombineImages :
                                      generateFluxImages}
                          disabled={isLoading ||
                            (selectedModel === 'text-removal' ? !textRemovalImageUrl :
                              selectedModel === 'home-designer' ? (!homeDesignerImageUrl || !inputPrompt.trim()) :
                                selectedModel === 'background-removal' ? (!backgroundRemovalImage || backgroundRemovalStatus !== 'Ready') :
                                  selectedModel === 'remove-object' ? (!removeObjectImageUrl || !hasMaskDrawn) :
                                    selectedModel === 'combine-image' ? (!combineImage1Url || !combineImage2Url || !inputPrompt.trim()) :
                                      !inputPrompt.trim())}
                          sx={{
                            padding: 0.7,
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                              transform: 'scale(1.1)',
                            },
                            '&.Mui-disabled': {
                              background: alpha(theme.palette.action.disabled, 0.12),
                              color: alpha(theme.palette.action.disabled, 0.26),
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <SendIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}
            {/* Selected Items */}
            {currentConfig.type === 'styles' && selectedItems.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: theme.palette.text.secondary }}>
                  Selected Styles
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedItems.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      onDelete={() => handleChipDelete(item)}
                      color="primary"
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                          color: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            color: 'white',
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Hair Style Specific Controls */}
            {selectedModel === 'hair-style' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image"
                  uploadedImage={uploadedImage}
                  uploadingImage={uploadingHairImage}
                  height="120px"
                  placeholderText="Click to upload image"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setUploadedImage(base64Data);

                        // Immediately upload to R2
                        setUploadingHairImage(true);
                        enqueueSnackbar('Uploading image to storage...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'hair-style-input.jpg');
                        if (url) {
                          setUploadedImageUrl(url);
                          enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
                        } else {
                          setUploadedImage(null); // Reset if upload failed
                        }
                        setUploadingHairImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setUploadedImage(null);
                    setUploadedImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />


              </>
            )}

            {/* Text Removal Specific Controls */}
            {selectedModel === 'text-removal' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image with Text to Remove"
                  uploadedImage={textRemovalImage}
                  uploadingImage={uploadingTextRemovalImage}
                  placeholderText="Click to upload an image with text to remove"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setTextRemovalImage(base64Data);

                        // Immediately upload to R2
                        setUploadingTextRemovalImage(true);
                        enqueueSnackbar('Uploading image to storage...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'text-removal-input.jpg');
                        if (url) {
                          setTextRemovalImageUrl(url);
                          enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
                        } else {
                          setTextRemovalImage(null); // Reset if upload failed
                        }
                        setUploadingTextRemovalImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setTextRemovalImage(null);
                    setTextRemovalImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    This tool will automatically remove text from your image while preserving the background.
                  </Typography>
                </Box>
              </>
            )}

            {/* Cartoonify Specific Controls */}
            {selectedModel === 'cartoonify' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image to Cartoonify"
                  uploadedImage={cartoonifyImage}
                  uploadingImage={uploadingCartoonifyImage}
                  placeholderText="Click to upload an image to cartoonify"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setCartoonifyImage(base64Data);

                        // Immediately upload to R2
                        setUploadingCartoonifyImage(true);
                        enqueueSnackbar('Uploading image to storage...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'cartoonify-input.jpg');
                        if (url) {
                          setCartoonifyImageUrl(url);
                          enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
                        } else {
                          setCartoonifyImage(null); // Reset if upload failed
                        }
                        setUploadingCartoonifyImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setCartoonifyImage(null);
                    setCartoonifyImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    This tool will transform your photo into a cartoon-style image.
                  </Typography>
                </Box>
              </>
            )}

            {/* Headshot Specific Controls */}
            {selectedModel === 'headshot' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image for Professional Headshot"
                  uploadedImage={headshotImage}
                  uploadingImage={uploadingHeadshotImage}
                  placeholderText="Click to upload an image for professional headshot"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setHeadshotImage(base64Data);

                        // Immediately upload to R2
                        setUploadingHeadshotImage(true);
                        enqueueSnackbar('Uploading image to storage...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'headshot-input.jpg');
                        if (url) {
                          setHeadshotImageUrl(url);
                          enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
                        } else {
                          setHeadshotImage(null); // Reset if upload failed
                        }
                        setUploadingHeadshotImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setHeadshotImage(null);
                    setHeadshotImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    This tool will transform your photo into a professional headshot with the selected background.
                  </Typography>
                </Box>
              </>
            )}

            {/* Restore Image Specific Controls */}
            {selectedModel === 'restore-image' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image to Restore"
                  uploadedImage={restoreImage}
                  uploadingImage={uploadingRestoreImage}
                  placeholderText="Click to upload an image to restore"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setRestoreImage(base64Data);

                        // Immediately upload to R2
                        setUploadingRestoreImage(true);
                        enqueueSnackbar('Uploading image to storage...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'restore-input.jpg');
                        if (url) {
                          setRestoreImageUrl(url);
                          enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
                        } else {
                          setRestoreImage(null); // Reset if upload failed
                        }
                        setUploadingRestoreImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setRestoreImage(null);
                    setRestoreImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    This tool will restore your image to its original quality.
                  </Typography>
                </Box>
              </>
            )}

            {/* GFP Restore Specific Controls */}
            {selectedModel === 'gfp-restore' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  uploadedImage={gfpRestoreImage}
                  uploadingImage={uploadingGfpRestoreImage}
                  placeholderText="Click to upload an image to restore with GFP-GAN"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setGfpRestoreImage(base64Data);

                        // Immediately upload to R2
                        setUploadingGfpRestoreImage(true);
                        enqueueSnackbar('Uploading image to storage...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'gfp-restore-input.jpg');
                        if (url) {
                          setGfpRestoreImageUrl(url);
                          enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
                        } else {
                          setGfpRestoreImage(null); // Reset if upload failed
                        }
                        setUploadingGfpRestoreImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setGfpRestoreImage(null);
                    setGfpRestoreImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    🎉 Free GFP-GAN restoration tool! Enhance your old or low-quality images without using credits.
                  </Typography>
                </Box>
              </>
            )}

            {/* Home Designer Specific Controls */}
            {selectedModel === 'home-designer' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Room Image"
                  uploadedImage={homeDesignerImage}
                  uploadingImage={uploadingHomeDesignerImage}
                  placeholderText="Click to upload a room image for interior design"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setHomeDesignerImage(base64Data);

                        // Immediately upload to R2
                        setUploadingHomeDesignerImage(true);
                        enqueueSnackbar('Uploading image to storage...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'home-designer-input.jpg');
                        if (url) {
                          setHomeDesignerImageUrl(url);
                          enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
                        } else {
                          setHomeDesignerImage(null); // Reset if upload failed
                        }
                        setUploadingHomeDesignerImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setHomeDesignerImage(null);
                    setHomeDesignerImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Upload a room image and describe your desired interior design style. AI will redesign your space!
                  </Typography>
                </Box>
              </>
            )}

            {/* Background Removal Specific Controls */}
            {selectedModel === 'background-removal' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image to Remove Background"
                  uploadedImage={backgroundRemovalImage}
                  uploadingImage={uploadingBackgroundRemovalImage}
                  placeholderText="Click to upload an image to remove background"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setBackgroundRemovalImage(base64Data);
                        enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setBackgroundRemovalImage(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Upload any image and our AI will automatically remove the background, leaving only the main subject. Processing happens locally in your browser.
                  </Typography>
                  {backgroundRemovalStatus !== 'Ready' && (
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                      Status: {backgroundRemovalStatus}
                    </Typography>
                  )}
                </Box>

                {/* Background Removal Processor - Hidden component that handles the processing */}
                {selectedModel === 'background-removal' && (
                  <BackgroundRemovalProcessor
                    inputImage={processingBackgroundRemoval ? backgroundRemovalImage : null}
                    onProcessingStart={handleBackgroundRemovalStart}
                    onProcessingComplete={handleBackgroundRemovalComplete}
                    onProcessingError={handleBackgroundRemovalError}
                    onStatusChange={handleBackgroundRemovalStatusChange}
                  />
                )}
              </>
            )}

            {/* Remove Object Specific Controls */}
            {selectedModel === 'remove-object' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image for Object Removal"
                  uploadedImage={removeObjectImage}
                  uploadingImage={uploadingRemoveObjectImage}
                  placeholderText="Click to upload an image for object removal"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setRemoveObjectImage(base64Data);

                        // Immediately upload to R2
                        setUploadingRemoveObjectImage(true);
                        enqueueSnackbar('Uploading image to storage...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'remove-object-input.jpg');
                        if (url) {
                          setRemoveObjectImageUrl(url);
                          enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
                        } else {
                          setRemoveObjectImage(null); // Reset if upload failed
                        }
                        setUploadingRemoveObjectImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setRemoveObjectImage(null);
                    setRemoveObjectImageUrl(null);
                    setRemoveObjectMask(null);
                    setHasMaskDrawn(false);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                {/* Mask Editor - Only show when image is uploaded */}
                {removeObjectImage && (
                  <ObjectRemovalMaskEditor
                    inputImage={removeObjectImage}
                    onMaskCreated={handleMaskCreated}
                    isLoading={isLoading}
                  />
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Upload an image and paint over the objects you want to remove. The AI will intelligently fill in the background.
                  </Typography>
                  {removeObjectImage && !hasMaskDrawn && (
                    <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                      Please paint over the objects you want to remove before processing.
                    </Typography>
                  )}
                </Box>
              </>
            )}

            {/* ReImagine Specific Controls */}
            {selectedModel === 'reimagine' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image for Impossible Scenario"
                  uploadedImage={reimagineImage}
                  uploadingImage={uploadingReimagineImage}
                  placeholderText="Click to upload an image for impossible scenario"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setReimagineImage(base64Data);

                        // Immediately upload to R2
                        setUploadingReimagineImage(true);
                        enqueueSnackbar('Uploading image to storage...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'reimagine-input.jpg');
                        if (url) {
                          setReimagineImageUrl(url);
                          enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
                        } else {
                          setReimagineImage(null); // Reset if upload failed
                        }
                        setUploadingReimagineImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setReimagineImage(null);
                    setReimagineImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    This tool will place you in an impossible scenario that would be difficult or impossible to achieve in real life.
                  </Typography>
                </Box>
              </>
            )}

            {/* Combine Image Specific Controls */}
            {selectedModel === 'combine-image' && (
              <>
                {/* Two Image Upload Section */}
                <Grid container spacing={2}>
                  {/* First Image Upload */}
                  <Grid item xs={12} md={6}>
                    <ImageUploader
                      title="Upload First Image"
                      uploadedImage={combineImage1}
                      uploadingImage={uploadingCombine1}
                      placeholderText="Click to upload first image"
                      height="120px"
                      onImageUpload={async (e) => {
                        const file = e.target.files[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const base64Data = event.target.result;
                            setCombineImage1(base64Data);

                            // Immediately upload to R2
                            setUploadingCombine1(true);
                            enqueueSnackbar('Uploading first image...', { variant: 'info' });
                            const url = await uploadImageToR2(base64Data, 'combine-image-1.jpg');
                            if (url) {
                              setCombineImage1Url(url);
                              enqueueSnackbar('First image uploaded successfully!', { variant: 'success' });
                            } else {
                              setCombineImage1(null); // Reset if upload failed
                            }
                            setUploadingCombine1(false);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      onImageRemove={() => {
                        setCombineImage1(null);
                        setCombineImage1Url(null);
                      }}
                      isDragging={isDragging}
                      isLoading={isLoading}
                      error={error}
                      handleDragOver={handleDragOver}
                      handleDragLeave={handleDragLeave}
                      handleDrop={handleDrop}
                    />
                  </Grid>

                  {/* Second Image Upload */}
                  <Grid item xs={12} md={6}>
                    <ImageUploader
                      title="Upload Second Image"
                      uploadedImage={combineImage2}
                      uploadingImage={uploadingCombine2}
                      placeholderText="Click to upload second image"
                      height="120px"
                      borderColor="secondary"
                      onImageUpload={async (e) => {
                        const file = e.target.files[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const base64Data = event.target.result;
                            setCombineImage2(base64Data);

                            // Immediately upload to R2
                            setUploadingCombine2(true);
                            enqueueSnackbar('Uploading second image...', { variant: 'info' });
                            const url = await uploadImageToR2(base64Data, 'combine-image-2.jpg');
                            if (url) {
                              setCombineImage2Url(url);
                              enqueueSnackbar('Second image uploaded successfully!', { variant: 'success' });
                            } else {
                              setCombineImage2(null); // Reset if upload failed
                            }
                            setUploadingCombine2(false);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      onImageRemove={() => {
                        setCombineImage2(null);
                        setCombineImage2Url(null);
                      }}
                      isDragging={isDragging}
                      isLoading={isLoading}
                      error={error}
                      handleDragOver={handleDragOver}
                      handleDragLeave={handleDragLeave}
                      handleDrop={handleDrop}
                    />
                  </Grid>
                </Grid>
              </>
            )}



            {/* Image Display Area */}
            <Box ref={imageGenerationRef}>
              <GeneratedImages
                images={generatedImages}
                isLoading={isLoading}
                numOutputs={numOutputs}
                selectedModel={selectedModel}
                handlePreview={handlePreview}
                handleDownload={handleDownload}
                removeImage={removeImage}
                canCompare={canCompareImages()}
                handleComparePreview={handleComparePreview}
                onPublish={handlePublishImage}
                inputPrompt={inputPrompt}
              />
            </Box>

            {/* Example Images Masonry */}
            <ExampleMasonry
              selectedModel={selectedModel}
              selectedGender={selectedGender}
              onImageClick={handleExampleImageClick}
              onPromptUse={handlePromptUse}
            />
          </MainEditor>
        </Box>

        {/* Enhanced Preview Modal */}
        <ImagePreviewModal
          open={previewOpen}
          onClose={handlePreviewClose}
          images={previewType === 'generated' ? generatedImages : exampleImages.map(img => img.url)}
          currentIndex={currentImageIndex}
          onImageChange={handleImageChange}
          selectedModel={selectedModel}
          imageInfo={
            previewType === 'example' && exampleImageInfo ? exampleImageInfo : {
              title: `Generated Image ${currentImageIndex + 1}`,
              prompt: inputPrompt || (selectedModel === 'generate-image' ? 'AI Generated Image' : getModelDisplayName(selectedModel)),
              // created: new Date().toLocaleDateString(),
              resolution: 'High Quality',
              format: previewImage?.startsWith('data:') ? 'Base64' : 'JPEG',
              selectedHairStyle: selectedModel === 'hair-style' ? selectedHairStyle : null,
              selectedScenario: selectedModel === 'reimagine' ? selectedScenario : null
            }
          }
          canCompare={canCompareImages()}
          beforeImage={
            selectedModel === 'hair-style' ? uploadedImage :
              selectedModel === 'text-removal' ? textRemovalImage :
                selectedModel === 'cartoonify' ? cartoonifyImage :
                  selectedModel === 'headshot' ? headshotImage :
                    selectedModel === 'restore-image' ? restoreImage :
                      selectedModel === 'gfp-restore' ? gfpRestoreImage :
                        selectedModel === 'home-designer' ? homeDesignerImage :
                          selectedModel === 'background-removal' ? backgroundRemovalImage :
                            selectedModel === 'remove-object' ? removeObjectImage :
                              selectedModel === 'reimagine' ? reimagineImage :
                                selectedModel === 'combine-image' ? combineImage1 :
                                  selectedModel === 'generate-image' && generatedImages.filter(img => img !== null).length >= 2
                                    ? generatedImages.filter(img => img !== null)[0] : null
          }
          afterImage={
            selectedModel === 'hair-style' ? generatedImages[0] :
              selectedModel === 'text-removal' ? generatedImages[0] :
                selectedModel === 'cartoonify' ? generatedImages[0] :
                  selectedModel === 'headshot' ? generatedImages[0] :
                    selectedModel === 'restore-image' ? generatedImages[0] :
                      selectedModel === 'gfp-restore' ? generatedImages[0] :
                        selectedModel === 'home-designer' ? generatedImages[0] :
                          selectedModel === 'background-removal' ? generatedImages[0] :
                            selectedModel === 'remove-object' ? generatedImages[0] :
                              selectedModel === 'reimagine' ? generatedImages[0] :
                                selectedModel === 'combine-image' ? generatedImages[0] :
                                  selectedModel === 'generate-image' && generatedImages.filter(img => img !== null).length >= 2
                                    ? generatedImages.filter(img => img !== null)[1] : null
          }
          beforeLabel={getComparisonLabels().before}
          afterLabel={getComparisonLabels().after}
          autoOpenComparison={autoOpenComparison}
        />
      </StyledPaper>
    </>
  );
} 