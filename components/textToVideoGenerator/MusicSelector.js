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
  Tooltip,
  Pagination,
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
  const [isLoading, setIsLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [paginationMetadata, setPaginationMetadata] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 5
  });

  // Use debounce for search to avoid too many API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Fetch music data when component mounts, page changes, or search query changes
  useEffect(() => {
    if (open) {
      fetchMusic();
    }
  }, [open, page, debouncedSearchQuery]);
  
  const fetchMusic = async () => {
    setIsLoading(true);
    try {
      // Server-side search and pagination
      const response = await nodeService.get(`/api/getAllListOfMusic`, {
        params: {
          page: page,
          limit: itemsPerPage,
          search: debouncedSearchQuery
        }
      });
      
      setSearchResults(response.data.music || []);
      if (response.data.pagination) {
        setPaginationMetadata(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching music:", error);
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

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    // Reset to first page when searching
    setPage(1);
  };

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

  const handlePageChange = (event, value) => {
    setPage(value);
    // If something is playing, stop it when changing pages
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      setCurrentTime(0);
      setCurrentlyPlaying(null);
      setAudioPlayer(null);
    }
  };

  const handleChipClick = (keyword) => {
    setSearchQuery(keyword);
    setPage(1);
  };

  // Get values from pagination metadata
  const totalPages = paginationMetadata.totalPages || 1;
  const totalCount = paginationMetadata.totalCount || 0;
  const currentPage = paginationMetadata.currentPage || page;
  const indexOfFirstItem = totalCount > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalCount);

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
            onChange={handleInputChange}
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
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {totalCount > 0 ? 
                        `Showing ${indexOfFirstItem}-${indexOfLastItem} of ${totalCount} results` : 
                        'No results found'}
                    </Typography>
                  </Box>
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
                            <Tooltip title={sound.bgmusicprompt}>
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
                                {/* Trim the prompt, If it start with the Keyworrd like, Create, Generate, Compose then remove it */}
                                {sound.bgmusicprompt
                                  .replace(/^(Create|Generate|Compose)(\s+(Create|Generate|Compose))*\s+/i, "")
                                  .trim()}
                              </Typography>
                            </Tooltip>

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
                                  onClick={() => handleChipClick(keyword)}
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
                  {totalPages > 1 && (
                    <Box display="flex" justifyContent="center" my={2}>
                      <Pagination 
                        count={totalPages} 
                        page={currentPage} 
                        onChange={handlePageChange} 
                        color="primary"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
