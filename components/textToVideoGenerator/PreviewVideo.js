import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import VideoPlayer from "./VideoPlayer";

function PreviewVideo({
  videoUrl,
  isPreviewVideoPopupOpen,
  handlePreviewVideoPopupClose,
  dataPointerId,
}) {
  const smBp = useMediaQuery("(min-width: 500px)");

  return (
    <Dialog
      open={isPreviewVideoPopupOpen}
      onClose={handlePreviewVideoPopupClose}
      fullScreen={!smBp}
    >
      <DialogTitle textAlign="center">Current Video</DialogTitle>
      <DialogContent
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <VideoPlayer generatedVideo={videoUrl} videoName={dataPointerId} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={handlePreviewVideoPopupClose}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PreviewVideo;
