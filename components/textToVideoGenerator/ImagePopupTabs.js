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
  Button,
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
  dataPointerBgMusicId,
  websocketInstance,
  handleAddImagePopupClose,
  handleRegenerateImage,
  handleUploadNewImage,
  handleUploadSearchedImage,
  handleUploadSearchedVideo,
  handlePointerMusicSelect,
  userId,
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
  const mdBp = useMediaQuery("(min-width: 800px)");

  const { enqueueSnackbar } = useSnackbar();
  
  const updateTime = (e) => {
    setCurrentTime(e.target.currentTime);
  };
  
  const handleTabValueChange = (event, newTabValue) => {
    setTabValue(newTabValue);
    if (newTabValue === 4) {
      setIsMusicSelectorOpen(true);
    }
  };

  const handlePreviewImagePopupOpen = () => setIsPreviewImagePopupOpen(true);
  const handlePreviewImagePopupClose = () => setIsPreviewImagePopupOpen(false);

  const handlePreviewVideoPopupOpen = () => setIsPreviewVideoPopupOpen(true);
  const handlePreviewVideoPopupClose = () => setIsPreviewVideoPopupOpen(false);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeEventListener("timeupdate", updateTime);
        audioPlayer.currentTime = 0;
        setCurrentTime(0);
        setCurrentlyPlaying(null);
        setAudioPlayer(null);
        setDuration(0);
      }
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
          console.error("No music URL received");
          return;
        }

        const newAudioPlayer = new Audio(musicUrl);

        // Set up duration once the metadata is loaded
        newAudioPlayer.addEventListener("loadedmetadata", () => {
          setDuration(newAudioPlayer.duration);
        });

        newAudioPlayer.addEventListener("timeupdate", updateTime);

        await newAudioPlayer.play();
        setAudioPlayer(newAudioPlayer);
        setCurrentlyPlaying(id);
        setCurrentTime(0);
      } catch (error) {
        console.error("Error playing music:", error);
      }
    }
  };

  const getDataPointerBgMusic = async () => {
    try {
      if (dataPointerBgMusicId.length === 0) {
        setSelectedMusic(null);
        return;
      }

      const response = await nodeService.get(
        `/api/getBgMusic/${dataPointerBgMusicId}`,
      );
      if (response.status === 200) {
        const { bgMusic, message } = response.data;
        console.log(message);
        setSelectedMusic(bgMusic);
        enqueueSnackbar(message, {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "success",
        });
      }
    } catch (error) {
      console.error(error.message);
      console.error(error.response.data.message);
      enqueueSnackbar(error.response.data.message, {
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        autoHideDuration: 3000,
        variant: "error",
      });
    }
  };

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

  useEffect(() => {
    if (tabValue === 4) getDataPointerBgMusic();
  }, [tabValue, dataPointerBgMusicId]);

  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeEventListener("timeupdate", updateTime);
        setAudioPlayer(null);
      }
    };
  }, [audioPlayer]);

  return (
    <Dialog
      open={addImagePopupOpen}
      onClose={async () => {
        await handlePlayPause(currentlyPlaying);
        handleAddImagePopupClose();
      }}
      fullWidth
      fullScreen={!mdBp}
      maxWidth="md"
    >
      <DialogTitle textAlign="center">
        Configure
        <Tabs
          value={tabValue}
          onChange={handleTabValueChange}
          centered
          orientation={mdBp || "vertical"}
        >
          <Tab sx={{ mx: "auto" }} label="Generate image" />
          <Tab sx={{ mx: "auto" }} label="Upload image" />
          <Tab sx={{ mx: "auto" }} label="Search image" />
          <Tab sx={{ mx: "auto" }} label="Search video" />
          <Tab sx={{ mx: "auto" }} label="Search music" />
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
        <CustomTabPanel value={tabValue} index={4}>
          <MusicSelector
            open={isMusicSelectorOpen}
            handleClose={() => setIsMusicSelectorOpen(false)}
            handleMusicSelect={async (bgMusicId) => {
              await handlePointerMusicSelect(dataPointerId, bgMusicId);
              setIsMusicSelectorOpen(false);
            }}
            projectId={projectId}
            selectedBgMusicId={dataPointerBgMusicId}
            userId={userId}
          />
          {selectedMusic === null ? (
            <Box textAlign="center" py={3}>
              <Typography variant="body1" mb={2}>No music is associated</Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setIsMusicSelectorOpen(true)}
              >
                Add Music
              </Button>
            </Box>
          ) : (
            <List sx={{ width: "100%" }}>
              <ListItem
                key={dataPointerBgMusicId}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  mb: 1,
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                  py: 2,
                  width: "100%",
                }}
              >
                <Box
                  display="flex"
                  alignItems="flex-start"
                  width="100%"
                  gap={2}
                >
                  <IconButton
                    edge="start"
                    onClick={() => handlePlayPause(dataPointerBgMusicId)}
                    sx={{ flexShrink: 0 }}
                  >
                    {currentlyPlaying === dataPointerBgMusicId ? (
                      <PauseIcon />
                    ) : (
                      <PlayArrowIcon />
                    )}
                  </IconButton>

                  <Box flexGrow={1} minWidth={0}>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: "1.2em",
                        maxHeight: "2.4em",
                      }}
                    >
                      {selectedMusic.bgmusicprompt}
                    </Typography>

                    <Box
                      display="flex"
                      flexWrap="wrap"
                      gap={0.5}
                      mb={1}
                      sx={{ maxWidth: "100%" }}
                    >
                      {selectedMusic.bgMusicKeywords?.map((keyword, idx) => (
                        <Chip
                          key={idx}
                          label={keyword}
                          size="small"
                          variant="outlined"
                          onClick={() => setSearchQuery(keyword)}
                          sx={{
                            maxWidth: "150px",
                            "& .MuiChip-label": {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      ))}
                    </Box>

                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      width="100%"
                    >
                      {currentlyPlaying === dataPointerBgMusicId ? (
                        <>
                          <Typography
                            variant="caption"
                            sx={{ minWidth: "45px" }}
                          >
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
                          <Typography
                            variant="caption"
                            sx={{ minWidth: "45px" }}
                          >
                            {formatTime(duration)}
                          </Typography>
                        </>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          Click play to preview
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            </List>
          )}
          {selectedMusic && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setIsMusicSelectorOpen(true)}
              >
                Change Music
              </Button>
            </Box>
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
          onClick={async () => {
            await handlePlayPause(currentlyPlaying);
            handleAddImagePopupClose();
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}

export default ImagePopupTabs;
