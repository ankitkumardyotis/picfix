import React, { useState, useEffect, useCallback, useContext } from 'react';
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
  Alert,
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material';
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
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
import GeneratedImages from '../components/GeneratedImages';

// Model configurations
const modelConfigurations = {
  'generate-image': {
    name: 'Generate Image',
    type: 'prompts',
    options: ['A sunset over mountains', 'Futuristic city', 'Abstract art', 'Nature landscape', 'Portrait photography']
  },
  'hair-style': {
    name: 'Hair Style',
    type: 'hair-style',
    hairStyles: [
      { id: 1, name: "No change", image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
      { id: 2, name: "Random", image: '/assets/ai-image-editor/hair-cut/Random.png' },
      { id: 3, name: "Messy Bun", image: '/assets/ai-image-editor/hair-cut/messy-bun.png' },
      { id: 4, name: "Soft Waves", image: '/assets/ai-image-editor/hair-cut/soft-wave.png' },
      { id: 5, name: "Blunt Bangs", image: '/assets/ai-image-editor/hair-cut/blunt-bang.png' },
      { id: 6, name: "Lob", image: '/assets/ai-image-editor/hair-cut/lob.jpg' },
      { id: 7, name: "Layered Shag", image: '/assets/ai-image-editor/hair-cut/layered-shag.jpg' },
      { id: 8, name: "High Ponytail", image: '/assets/ai-image-editor/hair-cut/high ponytail.png' },
      { id: 9, name: "Straight", image: '/assets/ai-image-editor/hair-cut/straight.png' },
      { id: 11, name: "Curly", image: '/assets/ai-image-editor/hair-cut/curly.jpg' },
      { id: 13, name: "Pixie Cut", image: '/assets/ai-image-editor/hair-cut/pixi-cut.jpg' },
      { id: 15, name: "Low Ponytail", image: '/assets/ai-image-editor/hair-cut/low-ponytail.jpg' }
    ],
    hairColors: [
      "No change", "Random", "Blonde", "Brunette", "Black", "Dark Brown", "Medium Brown", "Light Brown", "Auburn", "Copper", "Red", "Strawberry Blonde", "Platinum Blonde", "Silver", "White", "Blue", "Purple", "Pink", "Green", "Blue-Black", "Golden Blonde", "Honey Blonde", "Caramel", "Chestnut", "Mahogany", "Burgundy", "Jet Black", "Ash Brown", "Ash Blonde", "Titanium", "Rose Gold"
    ],
    genders: ["Male", "Female", "None"],
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ]
  },
  'combine-image': {
    name: 'Combine Image',
    type: 'prompts',
    options: [
      'Put the woman next to the house',
      'Merge the two landscapes together',
      'Combine the person with the background',
      'Place the object in the scene',
      'Blend the two images naturally',
      'Create a composite of both images',
      'Mix the foreground with the background',
      'Combine the elements seamlessly'
    ],
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ]
  },
  'text-removal': {
    name: 'Text Removal',
    type: 'text-removal',
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ]
  },
  'cartoonify': {
    name: 'Cartoonify',
    type: 'cartoonify',
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ]
  },
  'headshot': {
    name: 'Headshot',
    type: 'headshot',
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ],
    genders: ["Male", "Female", "None"],
    backgrounds: ["White", "Black", "Gray", "Neutral", "Office"]
  },
  'restore-image': {
    name: 'Restore Image',
    type: 'restore-image'
    // No aspect ratios needed for restore-image
  },
  'reimagine': {
    name: 'ReImagine',
    type: 'reimagine',
    genders: ["Male", "Female", "None"],
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ],
    scenarios: [
      "Random",
      "Floating in space as an astronaut",
      "Walking on the moon surface",
      "Spacewalk outside the International Space Station",
      "Standing on Mars in a spacesuit",
      "Swimming with great white sharks",
      "Deep sea diving with giant whales",
      "Underwater with full scuba gear surrounded by jellyfish",
      "Skydiving from 30,000 feet",
      "Wingsuit flying through mountains",
      "Bungee jumping from a helicopter",
      "Free climbing El Capitan without ropes",
      "Base jumping off a skyscraper",
      "Riding on the back of a great white shark",
      "Standing face-to-face with a roaring lion",
      "Swimming with killer whales in Arctic waters",
      "Gorilla encounter in dense jungle",
      "Running with a pack of cheetahs",
      "Standing in the eye of a hurricane",
      "Surfing a massive tsunami wave",
      "Volcano exploration in heat-proof suit",
      "Lightning strike survivor in a storm",
      "Avalanche escape on skis",
      "Motorcycle jumping over helicopters",
      "Hanging from a helicopter ladder",
      "High-speed car chase as driver",
      "Zipline across the Grand Canyon",
      "Parachuting into a volcano",
      "Flying through clouds without equipment",
      "Superhero landing with impact crater",
      "Dragon encounter in medieval armor",
      "Levitating with magical energy",
      "Standing on top of Mount Everest"
    ]
  }
};

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
  width: '280px',
  height: '100%',
  background: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
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
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
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
}));

const StyleCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '2px solid transparent',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: theme.shadows[12],
    borderColor: theme.palette.primary.main,
    '&::before': {
      transform: 'translateX(100%)',
    },
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
    transform: 'scale(1.02)',
  },
}));

const ImagePlaceholder = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '300px',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '0%',
    height: '0%',
    background: alpha(theme.palette.primary.main, 0.1),
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.6s, height 0.6s',
  },
  '&:hover': {
    borderColor: theme.palette.primary.main,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
    transform: 'scale(1.02)',
    '&::before': {
      width: '200%',
      height: '200%',
    },
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
  const [selectedModel, setSelectedModel] = useState('generate-image');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [qualityMode, setQualityMode] = useState('pro');
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
  const [selectedGender, setSelectedGender] = useState('None');
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

  // Hair style pagination state
  const [currentStylePage, setCurrentStylePage] = useState(0);

  // Preview modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Dynamic aspect ratio options based on selected model
  const getAspectRatioOptions = () => {
    if (selectedModel === 'hair-style' || selectedModel === 'combine-image') {
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

  // Add this after aspectRatioOptions
  const outputNumberOptions = [
    { value: 1, label: '1 Image' },
    { value: 2, label: '2 Images' },
    { value: 3, label: '3 Images' },
    { value: 4, label: '4 Images' },
  ];

  const handleModelChange = (event) => {
    const newModel = event.target.value;
    setSelectedModel(newModel);
    setSelectedItems([]);
    setSelectedStyles([]);
    
    // Reset hair style specific states when switching models
    if (newModel !== 'hair-style') {
      setSelectedHairStyle('No change');
      setSelectedHairColor('No change');
      setSelectedGender('None');
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
    if (newModel === 'hair-style' || newModel === 'combine-image' || newModel === 'text-removal' || newModel === 'cartoonify' || newModel === 'headshot' || newModel === 'reimagine') {
      setAspectRatio('match_input_image');
    } else if (newModel === 'restore-image') {
      // For restore-image, aspect ratio is not needed/used
      setAspectRatio('');
    } else {
      setAspectRatio('1:1');
    }
    
    // Set number of outputs based on model
    if (newModel === 'hair-style' || newModel === 'combine-image' || newModel === 'text-removal' || newModel === 'cartoonify' || newModel === 'headshot' || newModel === 'restore-image' || newModel === 'reimagine') {
      setNumOutputs(1);
      setGeneratedImages([null]);
    } else {
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
    setGeneratedImages(Array(numOutputs).fill(null));

    try {
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            generate_flux_images: true,
            prompt: inputPrompt,
            aspect_ratio: aspectRatio,
            num_outputs: numOutputs
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData || 'Failed to generate images');
      }

      const data = await response.json();
      setGeneratedImages(data);
      setInputPrompt('');
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
      setGeneratedImages([data]); // Hair style model returns single image
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
      setGeneratedImages([data]); // Combine image model returns single image
      setInputPrompt('');
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
      // Make sure we have a valid image URL or data URL
      if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
        setGeneratedImages([data]); // Text removal model returns single image
      } else if (Array.isArray(data) && data.length > 0) {
        setGeneratedImages([data[0]]); // Take the first item if it's an array
      } else {
        console.error("Unexpected text removal response format:", data);
        enqueueSnackbar('Error processing text removal image', { variant: 'error' });
        setGeneratedImages([null]);
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
      // Make sure we have a valid image URL or data URL
      if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
        setGeneratedImages([data]); // Cartoonify model returns single image
      } else if (Array.isArray(data) && data.length > 0) {
        setGeneratedImages([data[0]]); // Take the first item if it's an array
      } else {
        console.error("Unexpected cartoonify response format:", data);
        enqueueSnackbar('Error processing cartoonified image', { variant: 'error' });
        setGeneratedImages([null]);
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
      // Make sure we have a valid image URL or data URL
      if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
        setGeneratedImages([data]); // Headshot model returns single image
      } else if (Array.isArray(data) && data.length > 0) {
        setGeneratedImages([data[0]]); // Take the first item if it's an array
      } else {
        console.error("Unexpected headshot response format:", data);
        enqueueSnackbar('Error processing headshot image', { variant: 'error' });
        setGeneratedImages([null]);
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
      // Make sure we have a valid image URL or data URL
      if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
        setGeneratedImages([data]); // Restore image model returns single image
      } else if (Array.isArray(data) && data.length > 0) {
        setGeneratedImages([data[0]]); // Take the first item if it's an array
      } else {
        console.error("Unexpected restore image response format:", data);
        enqueueSnackbar('Error processing restored image', { variant: 'error' });
        setGeneratedImages([null]);
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

  const generateReimagineImage = async () => {
    if (!reimagineImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for reimagine
    setGeneratedImages([null]); // ReImagine model returns only 1 image

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
      // Make sure we have a valid image URL or data URL
      if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
        setGeneratedImages([data]); // ReImagine model returns single image
      } else if (Array.isArray(data) && data.length > 0) {
        setGeneratedImages([data[0]]); // Take the first item if it's an array
      } else {
        console.error("Unexpected reimagine response format:", data);
        enqueueSnackbar('Error processing reimagined image', { variant: 'error' });
        setGeneratedImages([null]);
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
    if (event.key === 'Enter' && !event.shiftKey) {
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

  console.log(selectedItems);
  console.log(inputPrompt);

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

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImages = [...generatedImages];
        newImages[index] = event.target.result;
        setGeneratedImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

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
  }, [generatedImages]);

  const currentConfig = modelConfigurations[selectedModel];

  const handleDownload = (imageUrl, index) => {
    // For base64 images
    if (imageUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${index + 1}.jpg`;
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
          link.download = `generated-image-${index + 1}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        });
    }
  };

  const handlePrevStylePage = () => {
    setCurrentStylePage(prevPage => prevPage - 1);
  };

  const handleNextStylePage = () => {
    setCurrentStylePage(prevPage => prevPage + 1);
  };

  const getCurrentStyleItems = () => {
    if (!currentConfig?.hairStyles) return [];
    const startIndex = currentStylePage * 10;
    const endIndex = startIndex + 10;
    return currentConfig.hairStyles.slice(startIndex, endIndex);
  };

  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewImage(null);
  };

  const totalPages = Math.ceil(currentConfig.hairStyles?.length / 10) || 0;

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

        <Box sx={{ display: 'flex', height: '100%', width: '100%', position: 'relative', marginTop: "3rem" }}>
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
            {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoAwesomeIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                PicFix.ai
              </Typography>
            </Box> */}

            {/* Model Selection */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Select Model</InputLabel>
              <Select
                value={selectedModel}
                onChange={handleModelChange}
                label="Select Model"
                sx={{ borderRadius: 2 }}
              >
                {Object.entries(modelConfigurations).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Aspect Ratio - Hide for restore-image model */}
            {selectedModel !== 'restore-image' && (
              <FormControl fullWidth variant="outlined">
                <InputLabel>Aspect Ratio</InputLabel>
                <Select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  label="Aspect Ratio"
                  sx={{ borderRadius: 2 }}
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
                        <Typography variant="body2">{option.label}</Typography>
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
                    sx={{ borderRadius: 2 }}
                  >
                    {currentConfig.hairColors.map((color, index) => (
                      <MenuItem key={index} value={color}>
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
                    sx={{ borderRadius: 2 }}
                  >
                    {currentConfig.genders.map((gender, index) => (
                      <MenuItem key={index} value={gender}>
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
                    sx={{ borderRadius: 2 }}
                  >
                    {currentConfig.genders.map((gender, index) => (
                      <MenuItem key={index} value={gender}>
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
                    sx={{ borderRadius: 2 }}
                  >
                    {currentConfig.backgrounds.map((background, index) => (
                      <MenuItem key={index} value={background}>
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
                    sx={{ borderRadius: 2 }}
                  >
                    {currentConfig.genders.map((gender, index) => (
                      <MenuItem key={index} value={gender}>
                        {gender}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Scenario Selection */}
                <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                  <InputLabel>Reimagine Yourself</InputLabel>
                  <Select
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario(e.target.value)}
                    label="Reimagine Yourself"
                    sx={{ borderRadius: 2 }}
                  >
                    {currentConfig.scenarios.map((scenario, index) => (
                      <MenuItem key={index} value={scenario}>
                        {scenario}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Number of Outputs */}
            {selectedModel !== 'hair-style' && selectedModel !== 'combine-image' && selectedModel !== 'text-removal' && selectedModel !== 'cartoonify' && selectedModel !== 'headshot' && selectedModel !== 'restore-image' && selectedModel !== 'reimagine' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Number of Outputs
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    p: 0.5,
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
                  selectedModel === 'reimagine' ? !reimagineImageUrl :
                  selectedModel === 'combine-image' ? (!combineImage1Url || !combineImage2Url || !inputPrompt.trim()) :
                  !inputPrompt.trim())}
                onClick={selectedModel === 'hair-style' ? generateHairStyleImages : 
                        selectedModel === 'text-removal' ? generateTextRemovalImage :
                        selectedModel === 'cartoonify' ? generateCartoonifyImage :
                        selectedModel === 'headshot' ? generateHeadshotImage :
                        selectedModel === 'restore-image' ? generateRestoreImage :
                        selectedModel === 'reimagine' ? generateReimagineImage :
                        selectedModel === 'combine-image' ? generateCombineImages : 
                        generateFluxImages}
                sx={{ 
                  borderRadius: 3,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
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
                {isLoading ? 'Generating...' : 
                 selectedModel === 'hair-style' ? 'Change Hair Style' : 
                 selectedModel === 'text-removal' ? 'Remove Text' :
                 selectedModel === 'cartoonify' ? 'Cartoonify Image' :
                 selectedModel === 'headshot' ? 'Generate Headshot' :
                 selectedModel === 'restore-image' ? 'Restore Image' :
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
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Choose Hair Style
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                  }}
                >
                  {/* Navigation Arrows */}
                  <IconButton
                    onClick={handlePrevStylePage}
                    disabled={currentStylePage === 0}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,1)',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: 'rgba(255,255,255,0.5)',
                      },
                    }}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>

                  <IconButton
                    onClick={handleNextStylePage}
                    disabled={currentStylePage >= totalPages - 1}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,1)',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: 'rgba(255,255,255,0.5)',
                      },
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>

                  {/* Hair Style Strip */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      overflowX: 'hidden',
                      px: 5, // Add padding for arrows
                      justifyContent: 'center',
                    }}
                  >
                    {getCurrentStyleItems().map((style) => (
                      <AppStyleCard
                        key={style.id}
                        onClick={() => setSelectedHairStyle(style.name)}
                        sx={{ minWidth: 80, flexShrink: 0 }}
                      >
                        <AppStyleIcon className={selectedHairStyle === style.name ? 'selected' : ''}>
                          <img src={style.image} alt={style.name} height={100} width={100} />
                        </AppStyleIcon>
                        <AppStyleLabel>{style.name}</AppStyleLabel>
                      </AppStyleCard>
                    ))}
                  </Box>

                  {/* Page Indicator */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      {currentStylePage + 1} of {totalPages}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              /* Styles Grid for other models */
              <>
                {currentConfig.type === 'styles' ? (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Choose Your Style
                    </Typography>
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
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Suggested Prompts
                    </Typography>
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
                            padding: '6px 20px',
                            fontSize: '14px',
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
            {selectedModel !== 'hair-style' && selectedModel !== 'text-removal' && selectedModel !== 'cartoonify' && selectedModel !== 'headshot' && selectedModel !== 'restore-image' && selectedModel !== 'reimagine' && (
              <Box sx={{ position: 'relative' }}>
                <StyledTextField
                  fullWidth
                  placeholder="Enter your creative prompt here..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
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
                        {selectedModel !== 'generate-image' && (
                          <label htmlFor="prompt-image-upload">
                            <Tooltip title="Upload Image">
                              <IconButton
                                component="span"
                                disabled={isLoading}
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                  '&:hover': {
                                    color: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                  },
                                }}
                              >
                                <CloudUploadIcon />
                              </IconButton>
                            </Tooltip>
                          </label>
                        )}
                        <IconButton 
                          onClick={selectedModel === 'hair-style' ? generateHairStyleImages : 
                                  selectedModel === 'text-removal' ? generateTextRemovalImage :
                                  selectedModel === 'combine-image' ? generateCombineImages : 
                                  generateFluxImages}
                          disabled={isLoading || 
                            (selectedModel === 'text-removal' ? !textRemovalImageUrl :
                            selectedModel === 'combine-image' ? (!combineImage1Url || !combineImage2Url || !inputPrompt.trim()) :
                            !inputPrompt.trim())}
                          sx={{ 
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
                          <SendIcon />
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
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Upload Image
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="hair-style-image-upload"
                    onChange={async (e) => {
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
                  />
                  <label htmlFor="hair-style-image-upload">
                    <Box
                      sx={{
                        width: '100%',
                        height: uploadedImage ? 'auto' : '120px',
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      {uploadedImage ? (
                        <Box sx={{ position: 'relative', width: '100%' }}>
                          <img
                            src={uploadedImage}
                            alt="Uploaded"
                            style={{
                              width: '100%',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              opacity: uploadingHairImage ? 0.5 : 1,
                            }}
                          />
                          {uploadingHairImage && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          )}
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              setUploadedImage(null);
                              setUploadedImageUrl(null);
                            }}
                            disabled={uploadingHairImage}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)',
                              },
                              '&.Mui-disabled': {
                                bgcolor: 'rgba(0,0,0,0.3)',
                                color: 'rgba(255,255,255,0.5)',
                              },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            Click to upload image
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </label>
                </Box>

                
              </>
            )}

            {/* Text Removal Specific Controls */}
            {selectedModel === 'text-removal' && (
              <>
                {/* Image Upload Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Upload Image with Text to Remove
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="text-removal-image-upload"
                    onChange={async (e) => {
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
                  />
                  <label htmlFor="text-removal-image-upload">
                    <Box
                      sx={{
                        width: '100%',
                        height: textRemovalImage ? 'auto' : '200px',
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      {textRemovalImage ? (
                        <Box sx={{ position: 'relative', width: '100%' }}>
                          <img
                            src={textRemovalImage}
                            alt="Uploaded"
                            style={{
                              width: '100%',
                              maxHeight: '300px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              opacity: uploadingTextRemovalImage ? 0.5 : 1,
                            }}
                          />
                          {uploadingTextRemovalImage && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          )}
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              setTextRemovalImage(null);
                              setTextRemovalImageUrl(null);
                            }}
                            disabled={uploadingTextRemovalImage}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)',
                              },
                              '&.Mui-disabled': {
                                bgcolor: 'rgba(0,0,0,0.3)',
                                color: 'rgba(255,255,255,0.5)',
                              },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            Click to upload an image with text to remove
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </label>
                </Box>
                
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
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Upload Image to Cartoonify
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="cartoonify-image-upload"
                    onChange={async (e) => {
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
                  />
                  <label htmlFor="cartoonify-image-upload">
                    <Box
                      sx={{
                        width: '100%',
                        height: cartoonifyImage ? 'auto' : '200px',
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      {cartoonifyImage ? (
                        <Box sx={{ position: 'relative', width: '100%' }}>
                          <img
                            src={cartoonifyImage}
                            alt="Uploaded"
                            style={{
                              width: '100%',
                              maxHeight: '300px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              opacity: uploadingCartoonifyImage ? 0.5 : 1,
                            }}
                          />
                          {uploadingCartoonifyImage && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          )}
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              setCartoonifyImage(null);
                              setCartoonifyImageUrl(null);
                            }}
                            disabled={uploadingCartoonifyImage}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)',
                              },
                              '&.Mui-disabled': {
                                bgcolor: 'rgba(0,0,0,0.3)',
                                color: 'rgba(255,255,255,0.5)',
                              },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            Click to upload an image to cartoonify
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </label>
                </Box>
                
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
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Upload Image for Professional Headshot
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="headshot-image-upload"
                    onChange={async (e) => {
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
                  />
                  <label htmlFor="headshot-image-upload">
                    <Box
                      sx={{
                        width: '100%',
                        height: headshotImage ? 'auto' : '200px',
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      {headshotImage ? (
                        <Box sx={{ position: 'relative', width: '100%' }}>
                          <img
                            src={headshotImage}
                            alt="Uploaded"
                            style={{
                              width: '100%',
                              maxHeight: '300px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              opacity: uploadingHeadshotImage ? 0.5 : 1,
                            }}
                          />
                          {uploadingHeadshotImage && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          )}
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              setHeadshotImage(null);
                              setHeadshotImageUrl(null);
                            }}
                            disabled={uploadingHeadshotImage}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)',
                              },
                              '&.Mui-disabled': {
                                bgcolor: 'rgba(0,0,0,0.3)',
                                color: 'rgba(255,255,255,0.5)',
                              },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            Click to upload an image for professional headshot
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </label>
                                 </Box>
                 
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
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Upload Image to Restore
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="restore-image-upload"
                    onChange={async (e) => {
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
                  />
                  <label htmlFor="restore-image-upload">
                    <Box
                      sx={{
                        width: '100%',
                        height: restoreImage ? 'auto' : '200px',
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      {restoreImage ? (
                        <Box sx={{ position: 'relative', width: '100%' }}>
                          <img
                            src={restoreImage}
                            alt="Uploaded"
                            style={{
                              width: '100%',
                              maxHeight: '300px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              opacity: uploadingRestoreImage ? 0.5 : 1,
                            }}
                          />
                          {uploadingRestoreImage && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          )}
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              setRestoreImage(null);
                              setRestoreImageUrl(null);
                            }}
                            disabled={uploadingRestoreImage}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)',
                              },
                              '&.Mui-disabled': {
                                bgcolor: 'rgba(0,0,0,0.3)',
                                color: 'rgba(255,255,255,0.5)',
                              },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            Click to upload an image to restore
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </label>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    This tool will restore your image to its original quality.
                  </Typography>
                </Box>
              </>
            )}

            {/* ReImagine Specific Controls */}
            {selectedModel === 'reimagine' && (
              <>
                {/* Image Upload Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Upload Image for Impossible Scenario
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="reimagine-image-upload"
                    onChange={async (e) => {
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
                  />
                  <label htmlFor="reimagine-image-upload">
                    <Box
                      sx={{
                        width: '100%',
                        height: reimagineImage ? 'auto' : '200px',
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      {reimagineImage ? (
                        <Box sx={{ position: 'relative', width: '100%' }}>
                          <img
                            src={reimagineImage}
                            alt="Uploaded"
                            style={{
                              width: '100%',
                              maxHeight: '300px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              opacity: uploadingReimagineImage ? 0.5 : 1,
                            }}
                          />
                          {uploadingReimagineImage && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          )}
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              setReimagineImage(null);
                              setReimagineImageUrl(null);
                            }}
                            disabled={uploadingReimagineImage}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)',
                              },
                              '&.Mui-disabled': {
                                bgcolor: 'rgba(0,0,0,0.3)',
                                color: 'rgba(255,255,255,0.5)',
                              },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            Click to upload an image for impossible scenario
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </label>
                </Box>
                
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
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Upload First Image
                      </Typography>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="combine-image-1-upload"
                        onChange={async (e) => {
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
                      />
                      <label htmlFor="combine-image-1-upload">
                        <Box
                          sx={{
                            width: '100%',
                            height: combineImage1 ? 'auto' : '120px',
                            border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            },
                          }}
                        >
                          {combineImage1 ? (
                            <Box sx={{ position: 'relative', width: '100%' }}>
                              <img
                                src={combineImage1}
                                alt="First Image"
                                style={{
                                  width: '100%',
                                  maxHeight: '150px',
                                  objectFit: 'contain',
                                  borderRadius: '8px',
                                  opacity: uploadingCombine1 ? 0.5 : 1,
                                }}
                              />
                              {uploadingCombine1 && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                >
                                  <CircularProgress size={20} />
                                </Box>
                              )}
                              <IconButton
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCombineImage1(null);
                                  setCombineImage1Url(null);
                                }}
                                disabled={uploadingCombine1}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  bgcolor: 'rgba(0,0,0,0.5)',
                                  color: 'white',
                                  '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                  },
                                  '&.Mui-disabled': {
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    color: 'rgba(255,255,255,0.5)',
                                  },
                                }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ textAlign: 'center' }}>
                              <CloudUploadIcon sx={{ fontSize: 30, color: theme.palette.primary.main, mb: 1 }} />
                              <Typography variant="body2" color="textSecondary" fontSize="12px">
                                Upload first image
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </label>
                    </Box>
                  </Grid>

                  {/* Second Image Upload */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Upload Second Image
                      </Typography>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="combine-image-2-upload"
                        onChange={async (e) => {
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
                      />
                      <label htmlFor="combine-image-2-upload">
                        <Box
                          sx={{
                            width: '100%',
                            height: combineImage2 ? 'auto' : '120px',
                            border: `2px dashed ${alpha(theme.palette.secondary.main, 0.3)}`,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            bgcolor: alpha(theme.palette.secondary.main, 0.05),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: theme.palette.secondary.main,
                              bgcolor: alpha(theme.palette.secondary.main, 0.08),
                            },
                          }}
                        >
                          {combineImage2 ? (
                            <Box sx={{ position: 'relative', width: '100%' }}>
                              <img
                                src={combineImage2}
                                alt="Second Image"
                                style={{
                                  width: '100%',
                                  maxHeight: '150px',
                                  objectFit: 'contain',
                                  borderRadius: '8px',
                                  opacity: uploadingCombine2 ? 0.5 : 1,
                                }}
                              />
                              {uploadingCombine2 && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                >
                                  <CircularProgress size={20} />
                                </Box>
                              )}
                              <IconButton
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCombineImage2(null);
                                  setCombineImage2Url(null);
                                }}
                                disabled={uploadingCombine2}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  bgcolor: 'rgba(0,0,0,0.5)',
                                  color: 'white',
                                  '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                  },
                                  '&.Mui-disabled': {
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    color: 'rgba(255,255,255,0.5)',
                                  },
                                }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ textAlign: 'center' }}>
                              <CloudUploadIcon sx={{ fontSize: 30, color: theme.palette.secondary.main, mb: 1 }} />
                              <Typography variant="body2" color="textSecondary" fontSize="12px">
                                Upload second image
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </label>
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Image Display Area */}
            <GeneratedImages
              images={generatedImages}
              isLoading={isLoading}
              numOutputs={numOutputs}
              selectedModel={selectedModel}
              handlePreview={handlePreview}
              handleDownload={handleDownload}
              removeImage={removeImage}
            />
          </MainEditor>
        </Box>

        {/* Preview Modal */}
        <Dialog
          open={previewOpen}
          onClose={handlePreviewClose}
          maxWidth="lg"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            pb: 1
          }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              Image Preview
            </Typography>
            <IconButton
              onClick={handlePreviewClose}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </StyledPaper>
    </>
  );
} 