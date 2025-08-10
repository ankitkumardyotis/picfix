import React from 'react'
import { Box, styled, alpha, FormControl, InputLabel, Select, MenuItem, Typography, Button, IconButton, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import modelConfigurations from '@/constant/ModelConfigurations';
import { Remove, Add, Dashboard, AccountBalanceRounded } from '@mui/icons-material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SplitButton from '../SplitButton';

function SidePanel({ aspectRatio, setAspectRatio, handleModelChange, selectedModel, setSelectedModel, selectedHairColor, setSelectedHairColor, selectedGender, setSelectedGender, selectedHeadshotGender, setSelectedHeadshotGender, selectedHeadshotBackground, setSelectedHeadshotBackground, selectedReimagineGender, setSelectedReimagineGender, selectedScenario, setSelectedScenario, numOutputs, setNumOutputs, generatedImages, setGeneratedImages, isLoading, context, generateHairStyleImages, generateTextRemovalImage, generateHeadshotImage, generateRestoreImage, generateGfpRestoreImage, generateHomeDesignerImage, generateBackgroundRemovalImage, generateRemoveObjectImage, generateReimagineImage, generateCombineImages, generateFluxImages, uploadedImageUrl, textRemovalImageUrl, cartoonifyImageUrl, headshotImageUrl, restoreImageUrl, gfpRestoreImageUrl, homeDesignerImageUrl, backgroundRemovalImage, backgroundRemovalStatus, removeObjectImageUrl, reimagineImageUrl, combineImage1Url, combineImage2Url, inputPrompt, hasMaskDrawn }) {

    const theme = useTheme();
    const currentConfig = modelConfigurations[selectedModel] || {};

    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const SidePanel = styled(Box)(({ theme }) => ({
        width: isMobile ? '100%' : '250px',
        background: isMobile ? 'transparent' : alpha(theme.palette.background.default, 0.5),
        backdropFilter: 'blur(10px)',
        borderRight: isMobile ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        padding: theme.spacing(1, 3),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        overflow: 'auto',
        boxShadow: isMobile ? 'none' : '4px 0 24px rgba(0,0,0,0.08)',
        // [theme.breakpoints.down('md')]: {
        //     width: '100%',
        //     position: 'absolute',
        //     zIndex: 1000,
        //     transform: 'translateX(-100%)',
        //     transition: 'transform 0.3s ease',
        // },
    }));


    const imageStyle = {
        borderRadius: '5px',
    };

    // Dynamic aspect ratio options based on selected model
    const getAspectRatioOptions = () => {
        if (selectedModel === 'hair-style' || selectedModel === 'combine-image' || selectedModel === 'home-designer' || selectedModel === 're-imagine') {
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

    return (

        < SidePanel >

            {/* Logo */}
            {!isMobile && < Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                <Link href="/">
                    <Image style={imageStyle} src="/assets/PicFixAILogo.jpg" alt="Logo" width={210} height={40} />
                </Link>
            </Box >}
            {/* Model Selection */}
            < FormControl fullWidth variant="outlined" >
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
                        <MenuItem
                            key={key}
                            value={key}
                            sx={{
                                fontSize: '12px',
                                fontWeight: 400,

                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minWidth: '40px',
                                            height: '12px',
                                            borderRadius: '10px',
                                            marginRight: '5px',
                                            paddingLeft: '-10px',
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            // opacity: 0,
                                            transform: 'translateX(10px)',
                                            transition: 'all 0.2s ease-in-out',
                                            ...(config.free ? {
                                                backgroundColor: '#e8f5e8',
                                                color: '#2e7d32',
                                                // border: '1px solid #4caf50'
                                            } : {
                                                backgroundColor: '#fff3e0',
                                                color: '#f57c00',
                                                // border: '1px solid #ff9800'
                                            })
                                        }}
                                    >
                                        {config.free ? 'Free' : 'Pro'}
                                    </Box>
                                    <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 400 }}>
                                        {config.name}
                                    </Typography>
                                </Box>
                                {/* Free/Pro Label - Hidden by default, shown on hover */}

                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl >
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
                                            // backgroundColor: alpha(theme.palette.grey[300], 0.3),
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
                                                // backgroundColor: theme.palette.primary.main,
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
            {
                selectedModel === 'hair-style' && (
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
                )
            }
            {/* Headshot Specific Sidebar Controls */}
            {
                selectedModel === 'headshot' && (
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
                )
            }

            {/* ReImagine Specific Sidebar Controls */}
            {
                selectedModel === 're-imagine' && (
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
                )
            }

            {
                selectedModel !== 'hair-style' && selectedModel !== 'combine-image' && selectedModel !== 'home-designer' && selectedModel !== 'background-removal' && selectedModel !== 'remove-object' && selectedModel !== 'text-removal' && selectedModel !== 'headshot' && selectedModel !== 'restore-image' && selectedModel !== 'gfp-restore' && selectedModel !== 're-imagine' && (
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
                                <Remove />
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
                                <Add />
                            </IconButton>
                        </Box>
                    </Box>
                )
            }

            {/* Additional Settings */}
            {!isMobile && < Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2, textAlign: 'center' }}>
                    Credits remaining: {context.creditPoints}
                </Typography>


                {/* <Button
                    fullWidth
                    variant="contained"
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                    disabled={isLoading}
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
                        "Generate Image"}   </Button> */}

                <SplitButton />

            </Box>}
            {/*Button with dropdown to navigate from editor to dashboard */}
            {/* <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Button 
                sx={{
                    borderRadius: 3,
                    py: 1,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '.8rem',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                }}
                startIcon={<AccountBalanceRounded />}
                onClick={() => router.push('/dashboard')}>
                    Dashboard
                </Button>
            </Box> */}
        </SidePanel >

    )
}

export default SidePanel

