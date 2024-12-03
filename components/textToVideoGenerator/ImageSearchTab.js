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

function ImageSearchTab({
  dataPointerId,
  handlePreviewImagePopupOpen,
  handleUploadSearchedImage,
}) {
  const [imageQuery, setImageQuery] = useState("");
  const [images, setImages] = useState(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const fetchedRef = useRef(false);

  const { enqueueSnackbar } = useSnackbar();

  const { ref, inView } = useInView();

  const handleFetchImages = async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    try {
      setIsLoadingImages(true);
      const response = await nodeService.post("/api/imageSearch", {
        query: imageQuery,
        pageNo,
      });

      if (response.status === 201) {
        const { message, imageSearchResults } = response.data;
        console.log(message);
        setImages((prevImageSearchResults) =>
          prevImageSearchResults
            ? [...prevImageSearchResults, ...imageSearchResults]
            : imageSearchResults,
        );
        setPageNo((prevPageNo) => prevPageNo + 1);
        setHasMore(imageSearchResults.length > 0);
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

    setIsLoadingImages(false);
  };

  useEffect(() => {
    if ((pageNo === 1 || inView) && hasMore) {
      handleFetchImages();
    }
  }, [pageNo, inView, hasMore]);

  useEffect(() => {
    fetchedRef.current = false;
  }, [pageNo]);

  const handleSearchImages = (e) => {
    e.preventDefault();

    if (imageQuery.length === 0) return;

    setImages(null);
    setPageNo(1);
    setHasMore(true);
    setSelectedImageUrl("");
  };

  let renderImages = null;
  if (isLoadingImages && pageNo === 1)
    renderImages = <CircularProgress disableShrink />;
  else {
    if (!images)
      renderImages = (
        <Typography textAlign="center">Search image of your choice.</Typography>
      );
    else {
      if (images.length === 0) {
        renderImages = (
          <Typography textAlign="center">No images found!</Typography>
        );
      } else {
        renderImages = (
          <ImageList cols={3} sx={{ width: "100%", height: "300px" }}>
            {images.map((image, index) =>
              index === images.length - 1 ? (
                <Box key={index} width="100%" height="100%" ref={ref}>
                  <ImageListItem>
                    <Image
                      src={image.imageURL}
                      alt={image.description}
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
                      onClick={() => setSelectedImageUrl(image.imageURL)}
                    >
                      <Radio
                        size="medium"
                        value={image.imageURL}
                        checked={selectedImageUrl === image.imageURL}
                        onChange={(e) => setSelectedImageUrl(e.target.value)}
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
                    src={image.imageURL}
                    alt={image.description}
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
                    onClick={() => setSelectedImageUrl(image.imageURL)}
                  >
                    <Radio
                      size="medium"
                      value={image.imageURL}
                      checked={selectedImageUrl === image.imageURL}
                      onChange={(e) => setSelectedImageUrl(e.target.value)}
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
        onSubmit={handleSearchImages}
      >
        <InputBase
          sx={{ ml: 0, flexGrow: 1 }}
          placeholder="Search Images"
          value={imageQuery}
          onChange={(e) => setImageQuery(e.target.value)}
          autoFocus
        />
        <IconButton sx={{ p: 0 }} onClick={handleSearchImages}>
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
          () => renderImages,
          [images, isLoadingImages, pageNo, selectedImageUrl],
        )}
      </Box>
      {isLoadingImages && pageNo > 1 && (
        <LinearProgress sx={{ width: "100%" }} />
      )}
      <Box mt={2} display="flex" justifyContent="end">
        <Button
          variant="contained"
          color="success"
          onClick={handlePreviewImagePopupOpen}
        >
          Preview image
        </Button>
        {selectedImageUrl && (
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#000",
              ml: 2,
              "&: hover": {
                backgroundColor: "#000",
              },
            }}
            onClick={() =>
              handleUploadSearchedImage(selectedImageUrl, dataPointerId)
            }
          >
            Upload
          </Button>
        )}
      </Box>
    </>
  );
}

export default ImageSearchTab;
