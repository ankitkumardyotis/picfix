import { useState } from "react";
import {
  TextField,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { useSnackbar } from "notistack";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import nodeService from "@/services/nodeService";
import ConfirmationDialogBox from "./ConfirmationDialogBox";
import ImageIcon from "@mui/icons-material/Image";
import ImagePopupTabs from "./ImagePopupTabs";

function VideoPointerConfig({
  index,
  dataPointer,
  handleUpdateDataPointers,
  handleAppendDataPointer,
  handleDeleteDataPointer,
  handleRegenerateImage,
  handleUploadNewImage,
  handleUploadSearchedImage,
  handleStartLoading,
  handleStopLoading,
}) {
  const [targetDataPointer, setTargetDataPointer] = useState(
    dataPointer.dataPointer,
  );
  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const [isNewDataPointerAppending, setIsNewDataPointerAppending] =
    useState(false);
  const [isDataPointerEditing, setIsDataPointerEditing] = useState(
    dataPointer.dataPointer.length === 0,
  );
  const [isDataPointerSaving, setIsDataPointerSaving] = useState(false);
  const [isDataPointerDeleting, setIsDataPointerDeleting] = useState(false);
  const [
    openSavePointerConfirmationDialogBox,
    setOpenSavePointerConfirmationDialogBox,
  ] = useState(false);
  const [
    openDeletePointerConfirmationDialogBox,
    setOpenDeletePointerConfirmationDialogBox,
  ] = useState(false);
  const [dataPointerAudio, setDataPointerAudio] = useState();
  const [initialDataPointerText, setInitialDataPointerText] = useState();
  const [addImagePopupOpen, setAddImagePopupOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const matches = useMediaQuery("(max-width:700px)");

  const router = useRouter();
  const { projectId } = router.query;

  const { data: session } = useSession();
  const userId = session?.user.id;

  const getDataPointerAudio = async (targetDataPointerId) => {
    handleStartLoading();
    try {
      if (dataPointer.audioName.length === 0) {
        const response = await nodeService.get(
          `/api/${userId}/${projectId}/generatePointerAudio/${targetDataPointerId}`,
        );

        if (response.status === 200) {
          const { message } = response.data;
          console.log(message);
          enqueueSnackbar(message, {
            anchorOrigin: { horizontal: "right", vertical: "bottom" },
            autoHideDuration: 3000,
            variant: "success",
          });
        }
      } else {
        const response = await nodeService.get(
          `/api/${userId}/${projectId}/getPointerAudio/${targetDataPointerId}`,
          {
            responseType: "arraybuffer",
          },
        );

        if (response.status === 200) {
          const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(audioBlob);
          const audioObject = new Audio(url);
          audioObject.play();
          setDataPointerAudio(audioObject);
          enqueueSnackbar("Audio loaded successfully!", {
            anchorOrigin: { horizontal: "right", vertical: "bottom" },
            autoHideDuration: 3000,
            variant: "success",
          });
        }
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
    handleStopLoading();
  };

  const handleDeletePointerConfirmationDialogBoxOpen = () =>
    setOpenDeletePointerConfirmationDialogBox(true);
  const handleDeletePointerConfirmationDialogBoxClose = () =>
    setOpenDeletePointerConfirmationDialogBox(false);

  const handleSavePointerConfirmationDialogBoxOpen = () =>
    setOpenSavePointerConfirmationDialogBox(true);
  const handleSavePointerConfirmationDialogBoxClose = () =>
    setOpenSavePointerConfirmationDialogBox(false);

  const handleAddImagePopupOpen = () => setAddImagePopupOpen(true);
  const handleAddImagePopupClose = () => setAddImagePopupOpen(false);


  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      width="100%"
    >
      <Box mt={1}>
        {isDataPointerEditing ? (
          <Tooltip title="Save text" arrow>
            <IconButton
              onClick={handleSavePointerConfirmationDialogBoxOpen}
              disabled={
                isNewDataPointerAppending ||
                isDataPointerSaving ||
                isDataPointerDeleting
              }
              color="primary"
            >
              {isDataPointerSaving ? (
                <CircularProgress size={17} />
              ) : (
                <SaveIcon />
              )}
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Edit text" arrow>
            <IconButton
              onClick={() => {
                setIsDataPointerEditing(true);
                setInitialDataPointerText(targetDataPointer);
              }}
              disabled={
                isNewDataPointerAppending ||
                isDataPointerSaving ||
                isDataPointerDeleting
              }
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        <ConfirmationDialogBox
          openConfirmationDialogBox={openSavePointerConfirmationDialogBox}
          handleConfirmationDialogBoxClose={
            handleSavePointerConfirmationDialogBoxClose
          }
          confirmationText="Do you really want to save changes?"
          handler={async () => {
            handleSavePointerConfirmationDialogBoxClose();
            setIsDataPointerSaving(true);
            await handleUpdateDataPointers(
              targetDataPointer,
              dataPointer.id,
              index,
            );
            setIsDataPointerSaving(false);
            if (targetDataPointer !== initialDataPointerText)
              setDataPointerAudio(null);
            setIsDataPointerEditing(false);
          }}
        />
      </Box>
      <Box
        p={1}
        position="relative"
        borderRadius=".6em"
        width={matches ? "100%" : "85%"}
        sx={{
          transition: "background-color 200ms 200ms",
          "&: hover": {
            backgroundColor: !isDataPointerEditing && "rgba(0,0,0,.05)",
          },
        }}
        onMouseOver={async () => {
          await new Promise((resolve) => setTimeout(() => resolve(), 200));
          setIsContainerHovered(true);
        }}
        onMouseOut={async () => {
          await new Promise((resolve) => setTimeout(() => resolve(), 200));
          setIsContainerHovered(false);
        }}
      >
        <TextField
          sx={{
            width: "100%",
          }}
          disabled={!isDataPointerEditing}
          autoFocus={isDataPointerEditing}
          id={`audio-text-${index + 1}`}
          label={`Audio text ${index + 1}`}
          value={targetDataPointer}
          helperText="You can set your own audio text and generate image accordingly."
          onChange={(e) => setTargetDataPointer(e.target.value)}
          placeholder={`Audio text ${index + 1}`}
          required
          size="small"
        />
        <Box
          component="div"
          display="flex"
          position="absolute"
          top="-2.6em"
          left={matches ? "5em" : 0}
          sx={{
            color: "#FFF",
            opacity: isContainerHovered || isDataPointerEditing ? 1 : 0,
          }}
        >
          <Tooltip title="Append new input" arrow>
            <IconButton
              onClick={async () => {
                setIsNewDataPointerAppending(true);
                await handleAppendDataPointer(index);
                setIsNewDataPointerAppending(false);
              }}
              disabled={
                isNewDataPointerAppending ||
                isDataPointerSaving ||
                isDataPointerDeleting
              }
              color="primary"
            >
              {isNewDataPointerAppending ? (
                <CircularProgress size={17} />
              ) : (
                <AddIcon />
              )}
            </IconButton>
          </Tooltip>
          <ConfirmationDialogBox
            openConfirmationDialogBox={openDeletePointerConfirmationDialogBox}
            handleConfirmationDialogBoxClose={
              handleDeletePointerConfirmationDialogBoxClose
            }
            confirmationText="Do you really want to delete this video input?"
            handler={async () => {
              setIsDataPointerDeleting(true);
              await handleDeleteDataPointer(dataPointer.id);
              setIsDataPointerDeleting(false);
              if (dataPointerAudio) {
                dataPointerAudio.pause();
                dataPointerAudio.currentTime = 0;
                setDataPointerAudio(null);
              }
            }}
          />
          <Tooltip title="Delete input" arrow>
            <IconButton
              onClick={handleDeletePointerConfirmationDialogBoxOpen}
              disabled={
                isNewDataPointerAppending ||
                isDataPointerSaving ||
                isDataPointerDeleting
              }
              color="error"
            >
              {isDataPointerDeleting ? (
                <CircularProgress color="error" size={17} />
              ) : (
                <DeleteIcon />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box
        mt={1}
        visibility={targetDataPointer.length > 0 ? "visible" : "hidden"}
      >
        <Tooltip
          title={
            dataPointer.audioName.length > 0 || dataPointerAudio
              ? "Play audio"
              : "Generate audio"
          }
          arrow
        >
          <IconButton
            onClick={() => getDataPointerAudio(dataPointer.id)}
            disabled={
              isNewDataPointerAppending ||
              isDataPointerSaving ||
              isDataPointerDeleting
            }
            color="primary"
            size={matches ? "small" : "medium"}
            sx={{
              position: "relative",
              backgroundColor: "#dee2e6",
              transition: "filter 700ms",
              "&:hover": {
                backgroundColor: "#ced4da",
                filter: "grayscale(.3)",
                cursor: "pointer",
              },
            }}
          >
            <VolumeUpIcon fontSize="small" />
            {!(dataPointerAudio || dataPointer.audioName.length > 0) && (
              <Box
                width="10px"
                height="10px"
                borderRadius="50%"
                bgcolor="#ef5350"
                position="absolute"
                zIndex={100}
                right={0}
                bottom={0}
              ></Box>
            )}
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        mt={1}
        visibility={targetDataPointer.length > 0 ? "visible" : "hidden"}
      >
        <Tooltip title="Upload new image" arrow>
          <IconButton
            disabled={
              isNewDataPointerAppending ||
              isDataPointerSaving ||
              isDataPointerDeleting
            }
            size={matches ? "small" : "medium"}
            onClick={handleAddImagePopupOpen}
            color="info"
            sx={{
              position: "relative",
              backgroundColor: "#dee2e6",
              transition: "filter 700ms",
              "&:hover": {
                backgroundColor: "#ced4da",
                filter: "grayscale(.3)",
                cursor: "pointer",
              },
            }}
          >
            <ImageIcon fontSize="small" />
            {dataPointer.imageName.length === 0 && (
              <Box
                width="10px"
                height="10px"
                borderRadius="50%"
                bgcolor="#ef5350"
                position="absolute"
                zIndex={100}
                right={0}
                bottom={0}
              ></Box>
            )}
          </IconButton>
        </Tooltip>
        <ImagePopupTabs
          imageName={dataPointer.imageName}
          addImagePopupOpen={addImagePopupOpen}
          projectId={projectId}
          dataPointerId={dataPointer.id}
          dataPointerText={dataPointer.keywords}
          dataPointerImageName={dataPointer.imageName}
          handleAddImagePopupClose={handleAddImagePopupClose}
          handleRegenerateImage={handleRegenerateImage}
          handleUploadNewImage={handleUploadNewImage}
          handleUploadSearchedImage={handleUploadSearchedImage}
        />
      </Box>
    </Box>
  );
}

export default VideoPointerConfig;
