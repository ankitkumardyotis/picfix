import { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  IconButton,
  useMediaQuery,
  List,
  ListItem,
  Box,
  Typography,
  Chip,
  Slider,

} from "@mui/material";
import ImageGenerationTab from "./ImageGenerationTab";
import ImageUploaderTab from "./ImageUploaderTab";
import CloseIcon from "@mui/icons-material/Close";
import PreviewImage from "./PreviewImage";
import ImageSearchTab from "./ImageSearchTab";
import VideoSearchTab from "./VideoSearchTab";
import PreviewVideo from "./PreviewVideo";
import MusicSelector from "./MusicSelector";
import { useSnackbar } from "notistack";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import nodeService from "@/services/nodeService";
import { Button } from "@mui/base";
import { useSession } from "next-auth/react";




function CustomTabPanel({ children, value, index }) {
  return value === index && children;
}

function ImagePopupTabs({
  addImagePopupOpen,
  projectId,
  dataPointerId,
  dataPointerText,
  dataPointerImageName,
  dataPointerVideoUrl,
  websocketInstance,
  handleAddImagePopupClose,
  handleRegenerateImage,
  handleUploadNewImage,
  handleUploadSearchedImage,
  handleUploadSearchedVideo,
}) {
  const [tabValue, setTabValue] = useState(0);
  const [isPreviewImagePopupOpen, setIsPreviewImagePopupOpen] = useState(false);
  const [isPreviewVideoPopupOpen, setIsPreviewVideoPopupOpen] = useState(false);
  const [isMusicSelectorOpen, setIsMusicSelectorOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const smBp = useMediaQuery("(min-width: 500px)");

  const { enqueueSnackbar } = useSnackbar();
  const handleTabValueChange = (event, newTabValue) => {
    setTabValue(newTabValue);
    if (newTabValue === 3) {
      setIsMusicSelectorOpen(true);
    }
  };
  const { data: session } = useSession();
  const userId = session?.user.id;

  const handlePreviewImagePopupOpen = () => setIsPreviewImagePopupOpen(true);
  const handlePreviewImagePopupClose = () => setIsPreviewImagePopupOpen(false);

  const handlePreviewVideoPopupOpen = () => setIsPreviewVideoPopupOpen(true);
  const handlePreviewVideoPopupClose = () => setIsPreviewVideoPopupOpen(false);

  useEffect(() => {
    if (websocketInstance) {
      const messageHandler = (event) => {
        const data = JSON.parse(event.data);

        const { type, targetPointerId } = data;
        if (
          type === "generated-pointer-image" &&
          targetPointerId === dataPointerId
        )
          handlePreviewImagePopupOpen();
      }; 
      websocketInstance.addEventListener("message", messageHandler);

      return () => {
        websocketInstance.removeEventListener("message", messageHandler);
      };
    }
  }, [websocketInstance]);

  const handleMusicSelect = async (sound) => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    try {
      await nodeService.get(`/api/updateMusicInPointer/${sound.bgMusicId}/${projectId}/${dataPointerId}`);
      setSelectedMusic(sound);
      enqueueSnackbar("Music selected successfully!", {
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        autoHideDuration: 3000,
        variant: "success",
      });
      setIsMusicSelectorOpen(false);
    } catch (error) {
      console.error('Error selecting sound:', error);
    }
  };


  const handleSelectMusic = async (sound) => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    try {
      await nodeService.get(`/api/${userId}/updateMusicInProject/${projectId}/${sound.bgMusicId}`);

      setSelectedMusic(sound);

      enqueueSnackbar("Music updated successfully!", {
        variant: "success",
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
      });

      // setIsMusicSelectorOpen(false);
    } catch (error) {
      console.error('Error selecting sound:', error);
      enqueueSnackbar("Failed to update music", {
        variant: "error",
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
      });
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const handleSeekChange = (event, newValue) => {
    setCurrentTime(newValue);
  };

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeekEnd = () => {
    setIsDragging(false);
    if (audioPlayer) {
      audioPlayer.currentTime = currentTime;
    }
  };

  const handlePlayPause = async (id) => {
    if (currentlyPlaying === id) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      setCurrentTime(0);
      setCurrentlyPlaying(null);
      setAudioPlayer(null);
      setDuration(0);
    } else {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }

      try {
        // Use the playMusicApi endpoint to get the music URL
        const response = await nodeService.get(`/api/playMusic/${id}`);
        const musicUrl = response.data.musicUrl;

        if (!musicUrl) {
          console.error('No music URL received');
          return;
        }

        const newAudioPlayer = new Audio(musicUrl);

        // Set up duration once the metadata is loaded
        newAudioPlayer.addEventListener('loadedmetadata', () => {
          setDuration(newAudioPlayer.duration);
        });

        await newAudioPlayer.play();
        setAudioPlayer(newAudioPlayer);
        setCurrentlyPlaying(id);
        setCurrentTime(0);
      } catch (error) {
        console.error('Error playing music:', error);
      }
    }
  };

  return (
    <Dialog
      open={addImagePopupOpen}
      onClose={handleAddImagePopupClose}
      fullWidth
      fullScreen={!smBp}
    >
      <DialogTitle textAlign="center">
        Configure image
        <Tabs
          value={tabValue}
          onChange={handleTabValueChange}
          centered
          orientation={smBp || "vertical"}
        >
          <Tab label="Generate image" />
          <Tab label="Upload image" />
          <Tab label="Unsplash" />
          <Tab label="Storyblocks" />
          <Tab label="Music" />
        </Tabs>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        <CustomTabPanel value={tabValue} index={0}>
          <ImageGenerationTab
            dataPointerId={dataPointerId}
            dataPointerText={dataPointerText}
            dataPointerImageName={dataPointerImageName}
            handleRegenerateImage={handleRegenerateImage}
            handlePreviewImagePopupOpen={handlePreviewImagePopupOpen}
          />
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
          <ImageUploaderTab
            dataPointerId={dataPointerId}
            dataPointerImageName={dataPointerImageName}
            handlePreviewImagePopupOpen={handlePreviewImagePopupOpen}
            handleUploadNewImage={handleUploadNewImage}
          />
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={2}>
          <ImageSearchTab
            dataPointerId={dataPointerId}
            dataPointerImageName={dataPointerImageName}
            handlePreviewImagePopupOpen={handlePreviewImagePopupOpen}
            handleUploadSearchedImage={handleUploadSearchedImage}
          />
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={3}>
          <VideoSearchTab
            dataPointerId={dataPointerId}
            dataPointerVideoUrl={dataPointerVideoUrl}
            handlePreviewVideoPopupOpen={handlePreviewVideoPopupOpen}
            handleUploadSearchedVideo={handleUploadSearchedVideo}
          />
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={3}>
          <MusicSelector
            open={isMusicSelectorOpen}
            handleClose={() => setIsMusicSelectorOpen(false)}
            handleMusicSelect={handleMusicSelect}
            projectId={projectId}
          />
          {selectedMusic === null ? (
            <Box textAlign="center" py={3}>
              <Typography variant="body1">No music found matching your search.</Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%' }}>
              <ListItem
                key={selectedMusic.bgMusicId}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  py: 2,
                  width: '100%'
                }}
              >
                <Box display="flex" alignItems="flex-start" width="100%" gap={2}>
                  <IconButton
                    edge="start"
                    onClick={() => handlePlayPause(selectedMusic.bgMusicId)}
                    sx={{ flexShrink: 0 }}
                  >
                    {currentlyPlaying === selectedMusic.bgMusicId ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>

                  <Box flexGrow={1} minWidth={0}>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.2em',
                        maxHeight: '2.4em'
                      }}
                    >
                      {selectedMusic.bgmusicprompt}
                    </Typography>

                    <Box
                      display="flex"
                      flexWrap="wrap"
                      gap={0.5}
                      mb={1}
                      sx={{ maxWidth: '100%' }}
                    >
                      {selectedMusic.bgMusicKeywords?.map((keyword, idx) => (
                        <Chip
                          key={idx}
                          label={keyword}
                          size="small"
                          variant="outlined"
                          onClick={() => setSearchQuery(keyword)}
                          sx={{
                            maxWidth: '150px',
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }
                          }}
                        />
                      ))}
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} width="100%">
                      {currentlyPlaying === selectedMusic.bgMusicId ? (
                        <>
                          <Typography variant="caption" sx={{ minWidth: '45px' }}>
                            {formatTime(currentTime)}
                          </Typography>
                          <Slider
                            size="small"
                            value={currentTime}
                            max={duration || 100}
                            onChange={handleSeekChange}
                            onMouseDown={handleSeekStart}
                            onMouseUp={handleSeekEnd}
                            onTouchStart={handleSeekStart}
                            onTouchEnd={handleSeekEnd}
                            sx={{ mx: 1 }}
                          />
                          <Typography variant="caption" sx={{ minWidth: '45px' }}>
                            {formatTime(duration)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Click play to preview
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            </List>
          )}
        </CustomTabPanel>
        <PreviewImage
          imageName={dataPointerImageName}
          isPreviewImagePopupOpen={isPreviewImagePopupOpen}
          handlePreviewImagePopupClose={handlePreviewImagePopupClose}
          projectId={projectId}
          dataPointerId={dataPointerId}
        />
        <PreviewVideo
          videoUrl={dataPointerVideoUrl}
          isPreviewVideoPopupOpen={isPreviewVideoPopupOpen}
          handlePreviewVideoPopupClose={handlePreviewVideoPopupClose}
          projectId={projectId}
          dataPointerId={dataPointerId}
        />
      </DialogContent>
      <DialogActions sx={{ position: "absolute", right: 0 }}>
        <IconButton
          size="small"
          color="error"
          sx={{
            backgroundColor: "#FFF",
            "&: hover": {
              backgroundColor: "rgba(220,220,220)",
            },
          }}
          onClick={handleAddImagePopupClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}

export default ImagePopupTabs;
