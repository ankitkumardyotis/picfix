import { useState } from "react";
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

function CustomTabPanel({ children, value, index }) {
  return value === index && children;
}

function ImagePopupTabs({
  imageName,
  addImagePopupOpen,
  projectId,
  dataPointerId,
  dataPointerText,
  dataPointerImageName,
  handleAddImagePopupClose,
  handleRegenerateImage,
  handleUploadNewImage,
  handleUploadSearchedImage,
}) {
  const [tabValue, setTabValue] = useState(0);
  const [isPreviewImagePopupOpen, setIsPreviewImagePopupOpen] = useState(false);
  const smBp = useMediaQuery("(min-width: 500px)");

  const handleTabValueChange = (event, newTabValue) => {
    setTabValue(newTabValue);
  };

  const handlePreviewImagePopupOpen = () => setIsPreviewImagePopupOpen(true);
  const handlePreviewImagePopupClose = () => setIsPreviewImagePopupOpen(false);

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
            handlePreviewImagePopupOpen={handlePreviewImagePopupOpen}
            handleUploadNewImage={handleUploadNewImage}
          />
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={2}>
          <ImageSearchTab
            dataPointerId={dataPointerId}
            handlePreviewImagePopupOpen={handlePreviewImagePopupOpen}
            handleUploadSearchedImage={handleUploadSearchedImage}
          />
        </CustomTabPanel>
        <PreviewImage
          imageName={imageName}
          isPreviewImagePopupOpen={isPreviewImagePopupOpen}
          handlePreviewImagePopupClose={handlePreviewImagePopupClose}
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
