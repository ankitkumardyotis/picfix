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
  handlePreviewImagePopupOpen,
  handleUploadNewImage,
}) {
  return (
    <>
      <Box
        border="2px dashed #ccc"
        borderRadius=".5em"
        width="80%"
        height="300px"
        mx="auto"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Button
          component="label"
          variant="contained"
          onChange={(e) => handleUploadNewImage(e, dataPointerId)}
          sx={{
            backgroundColor: "#000",
            borderRadius: ".3em",
            padding: "1.2em",
            "&:hover": {
              backgroundColor: "#000",
            },
          }}
        >
          Upload file
          <VisuallyHiddenInput type="file" accept=".png, .jpg, .jpeg" />
        </Button>
      </Box>
      <Button
        variant="contained"
        color="success"
        sx={{
          marginTop: "1em",
          display: "block",
          marginInline: "auto",
        }}
        onClick={handlePreviewImagePopupOpen}
      >
        Preview image
      </Button>
    </>
  );
}

export default ImageUploaderTab;
