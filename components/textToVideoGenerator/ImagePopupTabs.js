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
} from "@mui/material";
import ImageGenerationTab from "./ImageGenerationTab";
import ImageUploaderTab from "./ImageUploaderTab";
import CloseIcon from "@mui/icons-material/Close";
import PreviewImage from "./PreviewImage";
import ImageSearchTab from "./ImageSearchTab";
import VideoSearchTab from "./VideoSearchTab";
import PreviewVideo from "./PreviewVideo";

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
  const smBp = useMediaQuery("(min-width: 500px)");

  const handleTabValueChange = (event, newTabValue) => setTabValue(newTabValue);

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
