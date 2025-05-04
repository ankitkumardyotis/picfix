import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  CircularProgress,
  IconButton,
  Slider,
  Chip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import CloseIcon from "@mui/icons-material/Close";
import nodeService from "../../services/nodeService";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: "70%", md: "50%" },
  maxHeight: "80vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

export default function MusicSelector({
  open,
  handleClose,
  handleMusicSelect,
  selectedBgMusicId,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allMusic, setAllMusic] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch all music when component mounts
  useEffect(() => {
    if (open) {
      fetchInitialMusic();
    }
  }, [open]);

  const fetchInitialMusic = async () => {
    setIsLoading(true);
    try {
      const response = await nodeService.get("/api/getAllListOfMusic");
      setAllMusic(response.data.music || []);
      setSearchResults(response.data.music || []);
    } catch (error) {
      console.error("Error fetching initial music:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
    };
  }, [audioPlayer]);

  useEffect(() => {
    if (audioPlayer) {
      // Update time
      const timeUpdate = () => {
        if (!isDragging) {
          setCurrentTime(audioPlayer.currentTime);
        }
      };

      // Update duration
      const loadedData = () => {
        setDuration(audioPlayer.duration);
      };

      // Handle audio end
      const ended = () => {
        setCurrentTime(0);
        setCurrentlyPlaying(null);
        setAudioPlayer(null);
      };

      audioPlayer.addEventListener("timeupdate", timeUpdate);
      audioPlayer.addEventListener("loadeddata", loadedData);
      audioPlayer.addEventListener("ended", ended);

      return () => {
        audioPlayer.removeEventListener("timeupdate", timeUpdate);
        audioPlayer.removeEventListener("loadeddata", loadedData);
        audioPlayer.removeEventListener("ended", ended);
      };
    }
  }, [audioPlayer, isDragging]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(allMusic);
      return;
    }

    // Filter music based on keywords
    const filteredMusic = allMusic.filter((music) => {
      const queryLower = searchQuery.toLowerCase();

      // Check if query matches any keywords
      const keywordMatch = music.bgMusicKeywords?.some((keyword) =>
        keyword.toLowerCase().includes(queryLower),
      );

      // Check if query matches in prompt
      const promptMatch = music.bgmusicprompt
        ?.toLowerCase()
        .includes(queryLower);

      return keywordMatch || promptMatch;
    });

    setSearchResults(filteredMusic);
  };

  // Run search when searchQuery changes
  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const handlePlayPause = async (id) => {
    if (currentlyPlaying === id) {
      if (audioPlayer) {
        audioPlayer.pause();
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

        await newAudioPlayer.play();
        setAudioPlayer(newAudioPlayer);
        setCurrentlyPlaying(id);
        setCurrentTime(0);
      } catch (error) {
        console.error("Error playing music:", error);
      }
    }
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      open={open}
      onClose={async () => {
        await handlePlayPause(currentlyPlaying);
        handleClose();
      }}
      aria-labelledby="music-selector-modal"
    >
      <Box sx={style}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="h2">
            Select Background Music
          </Typography>
          <IconButton
            onClick={async () => {
              await handlePlayPause(currentlyPlaying);
              handleClose();
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box display="flex" gap={1} mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for music by keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            pr: 1,
          }}
        >
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {searchResults.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <Typography variant="body1">
                    No music found matching your search.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ width: "100%" }}>
                  {searchResults.map((sound) => (
                    <ListItem
                      key={sound.bgMusicId}
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
                          onClick={() => handlePlayPause(sound.bgMusicId)}
                          sx={{ flexShrink: 0 }}
                        >
                          {currentlyPlaying === sound.bgMusicId ? (
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
                            {sound.bgmusicprompt}
                          </Typography>

                          <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={0.5}
                            mb={1}
                            sx={{ maxWidth: "100%" }}
                          >
                            {sound.bgMusicKeywords?.map((keyword, idx) => (
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
                            {currentlyPlaying === sound.bgMusicId ? (
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

                        <Button
                          variant="contained"
                          onClick={async () => {
                            if (audioPlayer) {
                              audioPlayer.pause();
                              audioPlayer.currentTime = 0;
                              setCurrentTime(0);
                              setCurrentlyPlaying(null);
                              setAudioPlayer(null);
                            }

                            await handleMusicSelect(sound.bgMusicId);
                          }}
                          sx={{
                            ml: 2,
                            flexShrink: 0,
                            position: "sticky",
                            right: 0,
                          }}
                          disabled={sound.bgMusicId === selectedBgMusicId}
                        >
                          {sound.bgMusicId === selectedBgMusicId
                            ? "Selected"
                            : "Select"}
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
