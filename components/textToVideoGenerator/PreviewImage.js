import nodeService from "@/services/nodeService";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  DialogTitle,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import imageNotFound from "../../assets/image-not-found.png";
import { useSnackbar } from "notistack";
import Image from "next/image";

function PreviewImage({
  imageName,
  isPreviewImagePopupOpen,
  handlePreviewImagePopupClose,
  projectId,
  dataPointerId,
}) {
  const { data: session } = useSession();
  const userId = session?.user.id;

  const [pointerImage, setPointerImage] = useState();
  const smBp = useMediaQuery("(min-width: 500px)");

  const { enqueueSnackbar } = useSnackbar();

  const getCurrentImage = async () => {
    setPointerImage(null);
    try {
      const response = await nodeService.get(
        `/api/${userId}/${projectId}/getPointerImage/${dataPointerId}`,
      );

      if (response.status === 200) {
        const { message, pointerImageUrl } = response.data;
        console.log(message);
        setPointerImage(pointerImageUrl);
        enqueueSnackbar(message, {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "success",
        });
      }
    } catch (error) {
      setPointerImage(imageNotFound);
      console.error(error.message);
      console.error(error.response.data.message);
      enqueueSnackbar(error.response.data.message, {
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        autoHideDuration: 3000,
        variant: "error",
      });
    }
  };

  useEffect(() => {
    if (isPreviewImagePopupOpen) getCurrentImage();
  }, [isPreviewImagePopupOpen, imageName]);

  return (
    <Dialog
      open={isPreviewImagePopupOpen}
      onClose={handlePreviewImagePopupClose}
      fullScreen={!smBp}
    >
      <DialogTitle textAlign="center">Current Image</DialogTitle>
      <DialogContent
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        {pointerImage ? (
          <Image
            src={pointerImage}
            alt="data-pointer-image"
            sizes="100vw"
            width={0}
            height={0}
            style={{
              width: "100%",
              height: "auto",
            }}
            priority
          />
        ) : (
          <CircularProgress />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={handlePreviewImagePopupClose}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PreviewImage;
