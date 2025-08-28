import React from 'react'
import { Box, styled, alpha, InputAdornment, InputLabel,TextField ,Select, MenuItem, Typography, Button, IconButton, CircularProgress, useTheme, useMediaQuery, Chip } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import modelConfigurations from '@/constant/ModelConfigurations';
import { Remove, Add, SendIcon } from '@mui/icons-material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MobileConfigPanel from './MobileConfigPanel';
import ImageUploader from '../ImageUploader';
import ObjectRemovalMaskEditor from '../ObjectRemovalMaskEditor';
import BackgroundRemovalProcessor from '../BackgroundRemovalProcessor';

function MainEditor({ selectedModel, inputSectionRef, selectedGender, selectedHairStyle, setSelectedHairStyle, selectedItems, setSelectedItems, inputPrompt, setInputPrompt, handleKeyPress, generateHairStyleImages, generateTextRemovalImage, generateHomeDesignerImage, generateBackgroundRemovalImage, generateRemoveObjectImage, generateCombineImages, generateFluxImages, uploadedImage, uploadingHairImage, setUploadedImage, setUploadedImageUrl, isDragging, handleDragOver, handleDragLeave, handleDrop, error, uploadImageToR2, generatedImages, setGeneratedImages, isLoading, textRemovalImageUrl, homeDesignerImageUrl, backgroundRemovalImage, backgroundRemovalStatus, removeObjectImageUrl, combineImage1Url, combineImage2Url, hasMaskDrawn, aspectRatio, setAspectRatio, handleModelChange, selectedHairColor, setSelectedHairColor, selectedHeadshotGender, setSelectedHeadshotGender, selectedHeadshotBackground, setSelectedHeadshotBackground, selectedReimagineGender, setSelectedReimagineGender, selectedScenario, setSelectedScenario, numOutputs, setNumOutputs, getAllStyleItems, AppStyleCard, AppStyleIcon, AppStyleLabel, handleStyleSelect, selectedStyles, handleChipClick, handleChipDelete }) {
    const theme = useTheme();
    const currentConfig = modelConfigurations[selectedModel] || {};
    const isMobile = useMediaQuery('(max-width: 600px)');
    const MainEditor = styled(Box)(({ theme }) => ({
        flex: 1,
        padding: theme.spacing(1, 3),
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
    

    return (
        <MainEditor>
            {/* Mobile Configuration Panel */}
            {isMobile && (
                <MobileConfigPanel
                    selectedModel={selectedModel}
                    handleModelChange={handleModelChange}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    selectedHairColor={selectedHairColor}
                    setSelectedHairColor={setSelectedHairColor}
                    selectedGender={selectedGender}
                    setSelectedGender={setSelectedGender}
                    selectedHeadshotGender={selectedHeadshotGender}
                    setSelectedHeadshotGender={setSelectedHeadshotGender}
                    selectedHeadshotBackground={selectedHeadshotBackground}
                    setSelectedHeadshotBackground={setSelectedHeadshotBackground}
                    selectedReimagineGender={selectedReimagineGender}
                    setSelectedReimagineGender={setSelectedReimagineGender}
                    selectedScenario={selectedScenario}
                    setSelectedScenario={setSelectedScenario}
                    numOutputs={numOutputs}
                    setNumOutputs={setNumOutputs}
                    generatedImages={generatedImages}
                    setGeneratedImages={setGeneratedImages}
                />
            )}
            
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
                    ) : currentConfig.type === 'text-removal'|| currentConfig.type === 'headshot' || currentConfig.type === 'restore-image' || currentConfig.type === 'reimagine' ? (
                        // Don't show anything for text-removal, headshot, restore-image, or reimagine type
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
            {selectedModel !== 'hair-style' && selectedModel !== 'text-removal' && selectedModel !== 'headshot' && selectedModel !== 'restore-image' && selectedModel !== 'gfp-restore' && selectedModel !== 'background-removal' && selectedModel !== 'remove-object' && selectedModel !== 're-imagine' && (
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
                                        title={
                                            selectedModel === 'generate-image' 
                                              ? `Generate ${numOutputs} image${numOutputs > 1 ? 's' : ''} (${(currentConfig.creditCost || 0) * numOutputs} credits)`
                                              : `Generate ${currentConfig.name || 'Image'} (${currentConfig.creditCost || 0} credits)`
                                        }
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
                                    const url = await uploadImageToR2(base64Data, 'hair-style-input.jpg');
                                    if (url) {
                                        setUploadedImageUrl(url);

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

                    {/* Generate Button for Hair Style */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={generateHairStyleImages}
                            disabled={!uploadedImageUrl || isLoading}
                            sx={{
                                py: .8,
                                px: 2,
                                borderRadius: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '14px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                },
                                '&:disabled': {
                                    background: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        >
                            {isLoading ? 'Changing Hair Style...' : `Change Hair Style (${currentConfig.creditCost || 0} credits)`}
                        </Button>
                    </Box>

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
                                    const url = await uploadImageToR2(base64Data, 'text-removal-input.jpg');
                                    if (url) {
                                        setTextRemovalImageUrl(url);

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

                    {/* <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            This tool will automatically remove text from your image while preserving the background.
          </Typography>
        </Box> */}

                    {/* Generate Button for Text Removal */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={generateTextRemovalImage}
                            disabled={!textRemovalImageUrl || isLoading}
                            sx={{
                                py: .8,
                                px: 2,
                                borderRadius: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '14px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                },
                                '&:disabled': {
                                    background: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        >
                            {isLoading ? 'Removing Text...' : `Remove Text (${currentConfig.creditCost || 0} credits)`}
                        </Button>
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
                                    const url = await uploadImageToR2(base64Data, 'headshot-input.jpg');
                                    if (url) {
                                        setHeadshotImageUrl(url);

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

                    {/* <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            This tool will transform your photo into a professional headshot with the selected background.
          </Typography>
        </Box> */}

                    {/* Generate Button for Headshot */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={generateHeadshotImage}
                            disabled={!headshotImageUrl || isLoading}
                            sx={{
                                py: .8,
                                px: 2,
                                borderRadius: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '14px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                },
                                '&:disabled': {
                                    background: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        >
                            {isLoading ? 'Generating Headshot...' : `Generate Headshot (${currentConfig.creditCost || 0} credits)`}
                        </Button>
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
                                    const url = await uploadImageToR2(base64Data, 'restore-input.jpg');
                                    if (url) {
                                        setRestoreImageUrl(url);

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

                    {/* <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            This tool will restore your image to its original quality.
          </Typography>
        </Box> */}

                    {/* Generate Button for Restore Image */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={generateRestoreImage}
                            disabled={!restoreImageUrl || isLoading}
                            sx={{
                                py: .8,
                                px: 2,
                                borderRadius: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '14px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                },
                                '&:disabled': {
                                    background: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        >
                            {isLoading ? 'Restoring Image...' : `Restore Image (${currentConfig.creditCost || 0} credits)`}
                        </Button>
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
                        placeholderText="Click to upload an image to restore with  "
                        onImageUpload={async (e) => {
                            const file = e.target.files[0];
                            if (file && file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                    const base64Data = event.target.result;
                                    setGfpRestoreImage(base64Data);

                                    // Immediately upload to R2
                                    setUploadingGfpRestoreImage(true);
                                    const url = await uploadImageToR2(base64Data, 'gfp-restore-input.jpg');
                                    if (url) {
                                        setGfpRestoreImageUrl(url);

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

                    {/* <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            🎉 Free   restoration tool! Enhance your old or low-quality images without using credits.
          </Typography>
        </Box> */}

                    {/* Generate Button for GFP Restore */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={generateGfpRestoreImage}
                            disabled={!gfpRestoreImageUrl || isLoading}
                            sx={{
                                py: .8,
                                px: 2,
                                borderRadius: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '14px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                },
                                '&:disabled': {
                                    background: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        >
                            {isLoading ? 'Restoring Image...' : `Restore Image (${currentConfig.creditCost || 0} credits)`}
                        </Button>
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
                                    const url = await uploadImageToR2(base64Data, 'home-designer-input.jpg');
                                    if (url) {
                                        setHomeDesignerImageUrl(url);

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

                    {/* <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Upload a room image and describe your desired interior design style. AI will redesign your space!
          </Typography>
        </Box> */}
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

                    {/* <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Upload any image and our AI will automatically remove the background, leaving only the main subject. Processing happens locally in your browser.
          </Typography>
          {backgroundRemovalStatus !== 'Ready' && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              Status: {backgroundRemovalStatus}
            </Typography>
          )}
        </Box> */}

                    {/* Generate Button for Background Removal */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (backgroundRemovalImage) {
                                    setProcessingBackgroundRemoval(true);
                                }
                            }}
                            disabled={!backgroundRemovalImage || processingBackgroundRemoval || backgroundRemovalStatus !== 'Ready'}
                            sx={{
                                py: .8,
                                px: 2,
                                borderRadius: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '14px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                },
                                '&:disabled': {
                                    background: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                            startIcon={processingBackgroundRemoval ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        >
                            {processingBackgroundRemoval ? 'Removing Background...' : `Remove Background (${currentConfig.creditCost || 0} credits)`}
                        </Button>
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
                                    const url = await uploadImageToR2(base64Data, 'remove-object-input.jpg');
                                    if (url) {
                                        setRemoveObjectImageUrl(url);

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
                        {/* <Typography variant="body2" color="textSecondary">
            Upload an image and paint over the objects you want to remove. The AI will intelligently fill in the background.
          </Typography> */}
                        {removeObjectImage && !hasMaskDrawn && (
                            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                                Please paint over the objects you want to remove before processing.
                            </Typography>
                        )}
                    </Box>

                    {/* Generate Button for Remove Object */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={generateRemoveObjectImage}
                            disabled={!removeObjectImageUrl || !hasMaskDrawn || isLoading}
                            sx={{
                                py: .8,
                                px: 2,
                                borderRadius: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '14px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                },
                                '&:disabled': {
                                    background: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        >
                            {isLoading ? 'Removing Objects...' : `Remove Objects (${currentConfig.creditCost || 0} credits)`}
                        </Button>
                    </Box>
                </>
            )}

            {/* ReImagine Specific Controls */}
            {selectedModel === 're-imagine' && (
                <>
                    {/* Image Upload Section */}
                    <ImageUploader
                        title="Upload Image for ReImagine"
                        uploadedImage={reimagineImage}
                        uploadingImage={uploadingReimagineImage}
                        placeholderText="Click to upload an image for ReImagine Scenarios"
                        onImageUpload={async (e) => {
                            const file = e.target.files[0];
                            if (file && file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                    const base64Data = event.target.result;
                                    setReimagineImage(base64Data);

                                    // Immediately upload to R2
                                    setUploadingReimagineImage(true);
                                    const url = await uploadImageToR2(base64Data, 'reimagine-input.jpg');
                                    if (url) {
                                        setReimagineImageUrl(url);

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
                            This tool will place you in an ReImagine Scenarios that would be difficult or impossible to achieve in real life.
                        </Typography>
                    </Box>

                    {/* Generate Button for ReImagine */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={generateReimagineImage}
                            disabled={!reimagineImageUrl || isLoading}
                            sx={{
                                py: 1.5,
                                px: 3,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                },
                                '&:disabled': {
                                    background: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        >
                            {isLoading ? 'ReImagining...' : `ReImagine Scenarios (${currentConfig.creditCost || 0} credits)`}
                        </Button>
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

            {/* Edit Image Specific Controls */}
            {selectedModel === 'edit-image' && (
                <>
                    {/* Image Upload Section */}
                    <ImageUploader
                        title="Upload Image to Edit"
                        uploadedImage={editImage}
                        uploadingImage={uploadingEditImage}
                        placeholderText="Click to upload an image to edit"
                        onImageUpload={async (e) => {
                            const file = e.target.files[0];
                            if (file && file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                    const base64Data = event.target.result;
                                    setEditImage(base64Data);

                                    // Immediately upload to R2
                                    setUploadingEditImage(true);
                                    const url = await uploadImageToR2(base64Data, 'edit-image-input.jpg');
                                    if (url) {
                                        setEditImageUrl(url);

                                    } else {
                                        setEditImage(null); // Reset if upload failed
                                    }
                                    setUploadingEditImage(false);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                        onImageRemove={() => {
                            setEditImage(null);
                            setEditImageUrl(null);
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
                ref={exampleMasonryRef}
                key={`${selectedModel}-${selectedGender}-${session?.user?.id || 'guest'}`}
                selectedModel={selectedModel}
                selectedGender={selectedGender}
                onImageClick={handleExampleImageClick}
                onPromptUse={handlePromptUse}
            />
        </MainEditor>
    )
}

export default MainEditor