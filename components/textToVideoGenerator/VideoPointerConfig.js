import { useEffect, useState } from "react";
import {
  TextField,
  Box,
  IconButton,
  Tooltip,
  useMediaQuery,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
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
  currentDataPointerAudio,
  websocketInstance,
  handleSelectPointerChange,
  handleUpdateDataPointers,
  handleAppendDataPointer,
  handleDeleteDataPointer,
  handleRegenerateImage,
  handleUploadNewImage,
  handleUploadSearchedImage,
  handleStartLoading,
  handleStopLoading,
  handleCurrentDataPointerAudio,
  handlePlayPauseDataPointer,
}) {
  const [targetDataPointer, setTargetDataPointer] = useState(
    dataPointer.dataPointer,
  );
  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const [isDataPointerEditing, setIsDataPointerEditing] = useState(
    dataPointer.dataPointer.length === 0,
  );
  const [
    openSavePointerConfirmationDialogBox,
    setOpenSavePointerConfirmationDialogBox,
  ] = useState(false);
  const [
    openDeletePointerConfirmationDialogBox,
    setOpenDeletePointerConfirmationDialogBox,
  ] = useState(false);
  const [initialDataPointerText, setInitialDataPointerText] = useState();
  const [addImagePopupOpen, setAddImagePopupOpen] = useState(false);
  const mdBp = useMediaQuery("(min-width: 768px)");
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();
  const { projectId } = router.query;

  const { data: session } = useSession();
  const userId = session?.user.id;

  const handleDataPointerEdit = () => {
    setIsDataPointerEditing(true);
    setInitialDataPointerText(targetDataPointer);
  };

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
        );

        if (response.status === 200) {
          if (currentDataPointerAudio) {
            currentDataPointerAudio.pause();
            currentDataPointerAudio.currentTime = 0;
            handleCurrentDataPointerAudio(null);
          }
          handleCurrentDataPointerAudio(response.data.audioUrl);
          handlePlayPauseDataPointer(targetDataPointerId);
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

  const handleContainerHovered = () => setIsContainerHovered(true);
  const handleContainerNotHovered = () => setIsContainerHovered(false);

  useEffect(() => {
    if (dataPointer.isAudioPlaying && currentDataPointerAudio) {
      currentDataPointerAudio.play();
      currentDataPointerAudio.addEventListener("ended", () => {
        handleCurrentDataPointerAudio(null);
        handlePlayPauseDataPointer(null);
      });
    }

    return () => {
      if (dataPointer.isAudioPlaying && currentDataPointerAudio) {
        currentDataPointerAudio.pause();
        currentDataPointerAudio.currentTime = 0;
        currentDataPointerAudio.removeEventListener("ended", () => {
          handleCurrentDataPointerAudio(null);
          handlePlayPauseDataPointer(null);
        });
      }
    };
  }, [dataPointer.isAudioPlaying]);

  return (
    <>
      <FormControlLabel
        sx={{
          m: 0,
          mt: mdBp ? 2 : 1,
          flexGrow: 1,
          visibility: dataPointer.dataPointer.length > 0 ? "visible" : "hidden",
        }}
        control={<Checkbox sx={{ m: 0, p: 0 }} />}
        onChange={() => handleSelectPointerChange(index)}
        checked={dataPointer.generateMedia}
      />
      <Box mt={mdBp ? 1 : 0} flexGrow={1} textAlign="left">
        <Tooltip title={isDataPointerEditing ? "Save text" : "Edit text"} arrow>
          <IconButton
            onClick={() => {
              if (isDataPointerEditing)
                handleSavePointerConfirmationDialogBoxOpen();
              else handleDataPointerEdit();
            }}
            color="primary"
          >
            {isDataPointerEditing ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </Tooltip>
        <ConfirmationDialogBox
          openConfirmationDialogBox={openSavePointerConfirmationDialogBox}
          handleConfirmationDialogBoxClose={
            handleSavePointerConfirmationDialogBoxClose
          }
          confirmationText="Do you really want to save changes?"
          handler={async () => {
            handleSavePointerConfirmationDialogBoxClose();
            await handleUpdateDataPointers(
              targetDataPointer,
              dataPointer.id,
              index,
            );
            if (targetDataPointer !== initialDataPointerText)
              handleCurrentDataPointerAudio(null);
            setIsDataPointerEditing(false);
          }}
        />
      </Box>
      <Box
        p={mdBp ? 1 : 0}
        position="relative"
        borderRadius={2}
        flexGrow={40}
        sx={{
          transition: "background-color 200ms 200ms",
          "&: hover": {
            backgroundColor: !isDataPointerEditing && "rgba(0,0,0,.05)",
          },
        }}
        onMouseOver={handleContainerHovered}
        onMouseOut={handleContainerNotHovered}
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
          helperText={
            mdBp
              ? "You can set your own audio text and generate image accordingly."
              : ""
          }
          onChange={(e) => setTargetDataPointer(e.target.value)}
          placeholder={`Audio text ${index + 1}`}
          required
          size="small"
        />
        <Box
          display="flex"
          position="absolute"
          top={-42}
          left={0}
          visibility={
            mdBp
              ? isContainerHovered || isDataPointerEditing
                ? "visible"
                : "hidden"
              : "visible"
          }
        >
          <Tooltip title="Append new video input" arrow>
            <IconButton
              onClick={() => handleAppendDataPointer(index)}
              color="primary"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <ConfirmationDialogBox
            openConfirmationDialogBox={openDeletePointerConfirmationDialogBox}
            handleConfirmationDialogBoxClose={
              handleDeletePointerConfirmationDialogBoxClose
            }
            confirmationText="Do you really want to delete this video input?"
            handler={async () => {
              await handleDeleteDataPointer(dataPointer.id);
              if (currentDataPointerAudio) {
                currentDataPointerAudio.pause();
                currentDataPointerAudio.currentTime = 0;
                handleCurrentDataPointerAudio(null);
              }
            }}
          />
          <Tooltip title="Delete input" arrow>
            <IconButton
              onClick={handleDeletePointerConfirmationDialogBoxOpen}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box
        textAlign="right"
        mt={1}
        flexGrow={1}
        visibility={dataPointer.dataPointer.length > 0 ? "visible" : "hidden"}
        position={mdBp ? "static" : "absolute"}
        right={42}
        top={-50}
      >
        <Tooltip
          title={
            dataPointer.audioName.length > 0 ? "Play audio" : "Generate audio"
          }
          arrow
        >
          <IconButton
            onClick={() => getDataPointerAudio(dataPointer.id)}
            color="primary"
            size="medium"
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
            {dataPointer.isAudioPlaying ? (
              <PauseIcon fontSize="small" />
            ) : (
              <PlayArrowIcon fontSize="small" />
            )}
            {!dataPointer.audioName.length > 0 && (
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
        textAlign="right"
        mt={1}
        flexGrow={1}
        visibility={dataPointer.dataPointer.length > 0 ? "visible" : "hidden"}
        position={mdBp ? "static" : "absolute"}
        right={0}
        top={-50}
      >
        <Tooltip title="Upload new image" arrow>
          <IconButton
            size="medium"
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
          addImagePopupOpen={addImagePopupOpen}
          projectId={projectId}
          dataPointerId={dataPointer.id}
          dataPointerText={dataPointer.keywords}
          dataPointerImageName={dataPointer.imageName}
          websocketInstance={websocketInstance}
          handleAddImagePopupClose={handleAddImagePopupClose}
          handleRegenerateImage={handleRegenerateImage}
          handleUploadNewImage={handleUploadNewImage}
          handleUploadSearchedImage={handleUploadSearchedImage}
        />
      </Box>
    </>
  );
}

export default VideoPointerConfig;
