import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  InputBase,
  LinearProgress,
  Paper,
  Radio,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useMemo, useState, useRef } from "react";
import nodeService from "@/services/nodeService";
import { useSnackbar } from "notistack";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

function VideoSearchTab({
  dataPointerId,
  dataPointerVideoUrl,
  handlePreviewVideoPopupOpen,
  handleUploadSearchedVideo,
}) {
  const [videoQuery, setVideoQuery] = useState("");
  const [videos, setVideos] = useState(null);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const fetchedRef = useRef(false);

  const { enqueueSnackbar } = useSnackbar();

  const { ref, inView } = useInView();

  const handleFetchVideos = async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    try {
      setIsLoadingVideos(true);
      const response = await nodeService.post("/api/videoSearch", {
        query: videoQuery,
        pageNo,
      });

      if (response.status === 201) {
        const { message, videoSearchResults } = response.data;
        console.log(message);
        setVideos((prevVideosSearchResults) =>
          prevVideosSearchResults
            ? [...prevVideosSearchResults, ...videoSearchResults]
            : videoSearchResults,
        );
        setPageNo((prevPageNo) => prevPageNo + 1);
        setHasMore(videoSearchResults.length > 0);
        if (pageNo === 1)
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

    setIsLoadingVideos(false);
  };

  useEffect(() => {
    if ((pageNo === 1 || inView) && hasMore) {
      handleFetchVideos();
    }
  }, [pageNo, inView, hasMore]);

  useEffect(() => {
    fetchedRef.current = false;
  }, [pageNo]);

  const handleSearchVideos = (e) => {
    e.preventDefault();

    if (videoQuery.length === 0) return;

    setVideos(null);
    setPageNo(1);
    setHasMore(true);
    setSelectedVideoUrl("");
  };

  let renderVideos = null;
  if (isLoadingVideos && pageNo === 1)
    renderVideos = <CircularProgress disableShrink />;
  else {
    if (!videos)
      renderVideos = (
        <Typography textAlign="center">Search video of your choice.</Typography>
      );
    else {
      if (videos.length === 0) {
        renderVideos = (
          <Typography textAlign="center">No videos found!</Typography>
        );
      } else {
        renderVideos = (
          <ImageList cols={3} sx={{ width: "100%", height: "300px" }}>
            {videos.map((video, index) =>
              index === videos.length - 1 ? (
                <Box key={index} width="100%" height="100%" ref={ref}>
                  <ImageListItem>
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      sizes="100vw"
                      width={0}
                      height={0}
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      priority
                    />
                    <Box
                      position="absolute"
                      width="100%"
                      height="100%"
                      sx={{
                        transition: "background-color 150ms",
                        cursor: "pointer",
                        "&: hover": {
                          backgroundColor: "rgba(0,0,0,.5)",
                        },
                      }}
                      onClick={() => setSelectedVideoUrl(video.videoUrl)}
                    >
                      <Radio
                        size="medium"
                        value={video.videoUrl}
                        checked={selectedVideoUrl === video.videoUrl}
                        onChange={(e) => setSelectedVideoUrl(e.target.value)}
                        sx={{
                          color: "#FFF",
                          "&.Mui-checked": {
                            color: "#FFF",
                          },
                        }}
                      />
                    </Box>
                  </ImageListItem>
                </Box>
              ) : (
                <ImageListItem key={index}>
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    sizes="100vw"
                    width={0}
                    height={0}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    priority
                  />
                  <Box
                    position="absolute"
                    width="100%"
                    height="100%"
                    sx={{
                      transition: "background-color 150ms",
                      cursor: "pointer",
                      "&: hover": {
                        backgroundColor: "rgba(0,0,0,.5)",
                      },
                    }}
                    onClick={() => setSelectedVideoUrl(video.videoUrl)}
                  >
                    <Radio
                      size="medium"
                      value={video.videoUrl}
                      checked={selectedVideoUrl === video.videoUrl}
                      onChange={(e) => setSelectedVideoUrl(e.target.value)}
                      sx={{
                        color: "#FFF",
                        "&.Mui-checked": {
                          color: "#FFF",
                        },
                      }}
                    />
                  </Box>
                </ImageListItem>
              ),
            )}
          </ImageList>
        );
      }
    }
  }

  return (
    <>
      <Paper
        component="form"
        sx={{
          px: 2,
          py: 1,
          mx: "auto",
          display: "flex",
          width: "90%",
        }}
        onSubmit={handleSearchVideos}
      >
        <InputBase
          sx={{ ml: 0, flexGrow: 1 }}
          placeholder="Search Videos"
          value={videoQuery}
          onChange={(e) => setVideoQuery(e.target.value)}
          autoFocus
        />
        <IconButton sx={{ p: 0 }} onClick={handleSearchVideos}>
          <SearchIcon />
        </IconButton>
      </Paper>
      <Box
        mt={2}
        flexGrow={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        {useMemo(
          () => renderVideos,
          [videos, isLoadingVideos, pageNo, selectedVideoUrl],
        )}
      </Box>
      {isLoadingVideos && pageNo > 1 && (
        <LinearProgress sx={{ width: "100%" }} />
      )}
      <Box mt={2} display="flex" justifyContent="end">
        {dataPointerVideoUrl.length > 0 && (
          <Button
            variant="contained"
            color="success"
            onClick={handlePreviewVideoPopupOpen}
          >
            Preview video
          </Button>
        )}
        {selectedVideoUrl && (
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#000",
              ml: 2,
              "&: hover": {
                backgroundColor: "#000",
              },
            }}
            onClick={async () => {
              await handleUploadSearchedVideo(selectedVideoUrl, dataPointerId);
              handlePreviewVideoPopupOpen();
            }}
          >
            Upload
          </Button>
        )}
      </Box>
    </>
  );
}

export default VideoSearchTab;
