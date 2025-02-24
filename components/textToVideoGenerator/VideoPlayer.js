import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Slider,
  Menu,
  MenuItem,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
  Popover,
  Tooltip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";

function VideoPlayer({ generatedVideo, videoName }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [volumeAnchorEl, setVolumeAnchorEl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const videoRef = useRef();
  const playerRef = useRef();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setCurrentTime(video.currentTime);
    };

    const handlePlayPause = () => {
      setIsPlaying(!video.paused);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("play", handlePlayPause);
    video.addEventListener("pause", handlePlayPause);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("play", handlePlayPause);
      video.removeEventListener("pause", handlePlayPause);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenNow);
      // Close menus when fullscreen state changes
      setAnchorEl(null);
      setVolumeAnchorEl(null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    const newVolume = newValue / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;

    // Close any open menus before toggling fullscreen
    setAnchorEl(null);
    setVolumeAnchorEl(null);

    if (!document.fullscreenElement) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      } else if (playerRef.current.webkitRequestFullscreen) {
        playerRef.current.webkitRequestFullscreen();
      } else if (playerRef.current.mozRequestFullScreen) {
        playerRef.current.mozRequestFullScreen();
      } else if (playerRef.current.msRequestFullscreen) {
        playerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleSeek = (event, newValue) => {
    const newTime = (newValue / 100) * (videoRef.current?.duration || 0);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setProgress(newValue);
  };

  const handleDownload = () => {
    const video = videoRef.current;
    if (!video) return;

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = video.src;
    a.download = `${videoName}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    handleSettingsClose();
  };

  const handleVolumeClick = (event) => {
    setVolumeAnchorEl(event.currentTarget);
  };

  const handleVolumeClose = () => {
    setVolumeAnchorEl(null);
  };

  const handleSliderHover = (event) => {
    const sliderRect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - sliderRect.left;
    const percentage = (offsetX / sliderRect.width) * 100;
    const time = (percentage / 100) * duration;
    
    setHoverTime(time);
    setHoverPosition(offsetX);
  };

  const handleSliderLeave = () => {
    setHoverTime(null);
    setHoverPosition(null);
  };

  // Add keyboard event handlers
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, videoRef.current.duration);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          const newVolumeUp = Math.min(volume + 0.1, 1);
          handleVolumeChange(null, newVolumeUp * 100);
          break;
        case 'ArrowDown':
          e.preventDefault();
          const newVolumeDown = Math.max(volume - 0.1, 0);
          handleVolumeChange(null, newVolumeDown * 100);
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [volume, togglePlay, toggleMute, toggleFullscreen]);

  return (
    <Paper
      elevation={3}
      ref={playerRef}
      sx={{
        position: "relative",
        maxWidth: "1000px",
        mx: "auto",
        height: isFullscreen ? "100vh" : "auto",
        display: "flex",
        flexDirection: "column",
        bgcolor: "black",
      }}
    >
      <Box 
        position="relative" 
        onClick={togglePlay}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey",
        }}
      >
        <video
          ref={videoRef}
          width="100%"
          height={isFullscreen ? "auto" : "100%"}
          src={generatedVideo}
          onClick={(e) => e.stopPropagation()}
          style={{ objectFit: "contain" }}
          onError={(e) => {
            console.error('Video playback error:', e);
            // Handle error appropriately - maybe show an error message to user
          }}
        >
          Your browser does not support the video tag.
        </video>
        {!isPlaying && (
          <Tooltip title="Play video" arrow>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              bgcolor="rgba(0, 0, 0, 0.5)"
              borderRadius="50%"
              p={2}
              sx={{
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 60, color: "white" }} />
            </Box>
          </Tooltip>
        )}
      </Box>
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bgcolor="rgba(0, 0, 0, 0.6)"
        p={isMobile ? 0.5 : 1}
      >
        <Box display="flex" alignItems="center" mb={0.5} position="relative">
          <Slider
            value={progress}
            onChange={handleSeek}
            size="small"
            sx={{ mx: 2 }}
            onMouseMove={handleSliderHover}
            onMouseLeave={handleSliderLeave}
          />
          {hoverTime !== null && (
            <Box
              sx={{
                position: 'absolute',
                left: `${hoverPosition}px`,
                bottom: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                mb: 1,
                zIndex: 1,
              }}
            >
              {formatTime(hoverTime)}
            </Box>
          )}
          <Box
            sx={{
              color: 'primary.main',
              fontSize: '0.75rem',
              minWidth: 85,
              textAlign: 'right',
              mr: 1
            }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <IconButton onClick={togglePlay} color="primary" size="small">
              {isPlaying ? (
                <PauseIcon fontSize="small" />
              ) : (
                <PlayArrowIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton
              onClick={isMobile ? handleVolumeClick : toggleMute}
              color="primary"
              size="small"
            >
              {isMuted ? (
                <VolumeOffIcon fontSize="small" />
              ) : (
                <VolumeUpIcon fontSize="small" />
              )}
            </IconButton>
            {!isMobile && (
              <Slider
                value={volume * 100}
                onChange={handleVolumeChange}
                sx={{ width: 60, ml: 1 }}
                size="small"
              />
            )}
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleDownload} color="primary" size="small">
              <DownloadIcon fontSize="small" />
            </IconButton>
            <Button
              onClick={handleSettingsClick}
              startIcon={<SettingsIcon fontSize="small" />}
              color="primary"
              sx={{ fontSize: "0.75rem", py: 0.5, px: 1 }}
            >
              {playbackSpeed}x
            </Button>
            <IconButton onClick={toggleFullscreen} color="primary" size="small">
              {isFullscreen ? (
                <FullscreenExitIcon fontSize="small" />
              ) : (
                <FullscreenIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        container={isFullscreen ? playerRef.current : document.body}
        sx={{ 
          zIndex: 99999,
          '& .MuiPopover-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
          }
        }}
      >
        <Box sx={{ py: 1 }}>
          <MenuItem onClick={() => changePlaybackSpeed(0.5)}>0.5x Speed</MenuItem>
          <MenuItem onClick={() => changePlaybackSpeed(1)}>1x Speed</MenuItem>
          <MenuItem onClick={() => changePlaybackSpeed(1.5)}>1.5x Speed</MenuItem>
          <MenuItem onClick={() => changePlaybackSpeed(2)}>2x Speed</MenuItem>
        </Box>
      </Popover>
      <Popover
        open={Boolean(volumeAnchorEl)}
        anchorEl={volumeAnchorEl}
        onClose={handleVolumeClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Box p={1} height={100}>
          <Slider
            value={volume * 100}
            onChange={handleVolumeChange}
            orientation="vertical"
            sx={{ height: "100%" }}
          />
        </Box>
      </Popover>
    </Paper>
  );
}

export default VideoPlayer;
