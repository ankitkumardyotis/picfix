import { Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function ImageUploaderTab({
  dataPointerId,
  dataPointerImageName,
  handlePreviewImagePopupOpen,
  handleUploadNewImage,
}) {
  return (
    <>
      <Box
        border="2px dashed #ccc"
        borderRadius=".7rem"
        width="100%"
        height="300px"
        flexGrow={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Button
          component="label"
          variant="contained"
          onChange={async (e) => {
            await handleUploadNewImage(e, dataPointerId);
            handlePreviewImagePopupOpen();
          }}
          sx={{
            backgroundColor: "#000",
            borderRadius: ".3rem",
            p: 2,
            "&:hover": {
              backgroundColor: "#000",
            },
          }}
        >
          Upload file
          <VisuallyHiddenInput type="file" accept=".png, .jpg, .jpeg" />
        </Button>
      </Box>
      {dataPointerImageName.length > 0 && (
        <Button
          variant="contained"
          color="success"
          sx={{
            mt: 2,
            mx: "auto",
          }}
          onClick={handlePreviewImagePopupOpen}
        >
          Preview image
        </Button>
      )}
    </>
  );
}

export default ImageUploaderTab;
