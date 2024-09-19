import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef, useState } from "react";
import { TextareaAutosize as BaseTextareaAutosize } from "@mui/base/TextareaAutosize";
import { styled } from "@mui/system";
import {
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  FormLabel,
  Divider,
  Button,
  Card,
  Box,
  Typography,
  Backdrop,
  useMediaQuery,
  Checkbox,
  FormGroup,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import nodeService from "@/services/nodeService";
import { useSnackbar } from "notistack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VideoPointerConfig from "@/components/textToVideoGenerator/VideoPointerConfig";
import { socket } from "@/socket";

export default function Page() {
  const router = useRouter();
  const { projectId } = router.query;

  const { data: session } = useSession();
  const userId = session?.user.id;

  const [projectName, setProjectName] = useState("");
  const [article, setArticle] = useState("");
  const [audioLanguage, setAudioLanguage] = useState("english");
  const [pointersCount, setPointersCount] = useState(5);
  const [voiceType, setVoiceType] = useState("male");
  const [isLoading, setIsLoading] = useState(false);
  const [isSocketLoading, setIsSocketLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [socketLoadingText, setSocketLoadingText] = useState("");
  const [dataPointers, setDataPointers] = useState();
  const [mediaTypes, setMediaTypes] = useState({
    audios: false,
    images: false,
  });
  const [generatedVideo, setGeneratedVideo] = useState();
  const matches = useMediaQuery("(max-width:700px)");
  const { enqueueSnackbar } = useSnackbar();
  const downloadVideoBtnRef = useRef();

  const selectedPointers =
    dataPointers &&
    dataPointers.filter((dataPointer) => dataPointer.generateMedia);

  const handleAudioLanguageChange = (event) =>
    setAudioLanguage(event.target.value);

  const handlePointersCountChange = (event) =>
    setPointersCount(parseInt(event.target.value));

  const handleVoiceTypeChange = (event) => setVoiceType(event.target.value);

  const handleArticleChange = (e) => setArticle(e.target.value);

  const handleStartLoading = (loadingText = "Please wait...") => {
    setLoadingText(loadingText);
    setIsLoading(true);
  };
  const handleStopLoading = () => {
    setIsLoading(false);
    setLoadingText("");
  };
  const handleStartSocketLoading = (loadingText) => {
    setSocketLoadingText(loadingText);
    setIsSocketLoading(true);
  };
  const handleStopSocketLoading = () => {
    setIsSocketLoading(false);
    setSocketLoadingText("");
  };

  const handleGenerateDataPointers = async () => {
    if (article === "") {
      alert("Please provide the article before proceeding.");
      return;
    }

    handleStartLoading();

    try {
      const dataPointersResponse = await nodeService.post(
        `/api/${userId}/generateDataPointers/${projectId}`,
        {
          audioLanguage,
          pointersCount,
          article,
          voiceType,
        },
      );

      if (dataPointersResponse.status === 201) {
        setDataPointers(null);
        setGeneratedVideo(null);
        const { message } = dataPointersResponse.data;
        console.log(message);
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
    handleStopLoading();
  };

  const handleUpdateDataPointers = async (
    targetDataPointer,
    targetDataPointerId,
    index,
  ) => {
    if (targetDataPointer === "") {
      alert("Please enter the missing audio text field");
      return;
    }
    try {
      const response = await nodeService.post(
        `/api/${userId}/${projectId}/update/${targetDataPointerId}`,
        {
          dataPointer: targetDataPointer,
        },
      );

      if (response.status === 201) {
        const { message, updatedPointer } = response.data;
        console.log(message);
        setDataPointers((prevDataPointers) =>
          prevDataPointers.map((dataPointer, idx) =>
            idx === index
              ? { ...updatedPointer, generateMedia: false }
              : dataPointer,
          ),
        );
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
  };

  const handleRegenerateImage = async (targetDataPointerId, prompt) => {
    handleStartLoading();
    try {
      const response = await nodeService.post(
        `/api/${userId}/${projectId}/regenerateImage/${targetDataPointerId}`,
        {
          prompt,
        },
      );
      if (response.status === 201) {
        const { message } = response.data;
        console.log(message);
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
    handleStopLoading();
  };

  const handleUploadNewImage = async (event, targetDataPointerId) => {
    handleStartLoading();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const response = await nodeService.post(
            `/api/${userId}/${projectId}/uploadImage/${targetDataPointerId}`,
            {
              imageFileURL: reader.result,
            },
          );

          if (response.status === 201) {
            const { message } = response.data;
            console.log(message);
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
        handleStopLoading();
      };
    }
  };

  const handleUploadSearchedImage = async (selectedImageUrl, dataPointerId) => {
    handleStartLoading();
    try {
      const response = await nodeService.post(
        `/api/${userId}/${projectId}/uploadImage/${dataPointerId}`,
        {
          imageFileURL: selectedImageUrl,
        },
      );

      if (response.status === 201) {
        const { message } = response.data;
        console.log(message);
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
    handleStopLoading();
  };

  const handleGenerateMedia = async () => {
    handleStartLoading();
    try {
      const response = await nodeService.post(
        `/api/${userId}/generateMedia/${projectId}`,
        {
          selectedPointersIds: selectedPointers.map(
            (selectedPointer) => selectedPointer.id,
          ),
          mediaTypes,
        },
      );
      if (response.status === 201) {
        const { message } = response.data;
        console.log(message);
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
    handleStopLoading();
  };

  const handleGenerateVideo = async () => {
    handleStartLoading("Hang tight! We are generating your video...");
    setGeneratedVideo(null);

    try {
      const response = await nodeService.get(
        `/api/${userId}/generatevideo/${projectId}`,
        {
          responseType: "blob",
        },
      );

      if (response.status === 200) {
        const videoBlob = new Blob([response.data], { type: "video/mp4" });
        const videoUrl = URL.createObjectURL(videoBlob);
        setGeneratedVideo(videoUrl);
        enqueueSnackbar("Video generated successfully!", {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "success",
        });
      }
    } catch (error) {
      console.error(error.message);
      if (error.response.status === 400)
        enqueueSnackbar(
          "Please configure all the video inputs before proceeding",
          {
            anchorOrigin: { horizontal: "right", vertical: "bottom" },
            autoHideDuration: 3000,
            variant: "error",
          },
        );
      else if (error.response.status === 409)
        enqueueSnackbar(
          "We're currently working on your project. Please check back later for updates.",
          {
            anchorOrigin: { horizontal: "right", vertical: "bottom" },
            autoHideDuration: 3000,
            variant: "error",
          },
        );
      else if (error.response.status === 500)
        enqueueSnackbar("Unable to generate video at the moment!", {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "error",
        });
    }
    handleStopLoading();
  };

  const handleDownloadVideo = () => {
    if (downloadVideoBtnRef.current) {
      downloadVideoBtnRef.current.href = generatedVideo;
      downloadVideoBtnRef.current.download = `${projectName}.mp4`;
      downloadVideoBtnRef.current.click();
    }
  };

  const handleAppendDataPointer = async (index) => {
    try {
      const response = await nodeService.post(
        `/api/${userId}/${projectId}/create`,
        {
          index,
        },
      );

      if (response.status === 201) {
        const { message, newDataPointer } = response.data;
        console.log(message);
        setDataPointers((prevDataPointers) => {
          const newPointers = [...prevDataPointers];

          newPointers.splice(index + 1, 0, {
            id: newDataPointer.id,
            dataPointer: newDataPointer.dataPointer,
            keywords: newDataPointer.keywords,
            imageName: "",
            audioName: "",
          });

          return newPointers;
        });
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
  };

  const handleDeleteDataPointer = async (targetDataPointerId) => {
    try {
      const response = await nodeService.delete(
        `/api/${userId}/${projectId}/delete/${targetDataPointerId}`,
      );

      if (response.status === 200) {
        console.log(response.data.message);
        setDataPointers((prevDataPointers) =>
          prevDataPointers.filter(
            (dataPointer) => dataPointer.id !== targetDataPointerId,
          ),
        );
        enqueueSnackbar(response.data.message, {
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
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.index === destination.index) return;

    const draggableIndex = parseInt(draggableId.split("/")[1]);
    const newPointers = [...dataPointers];

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    newPointers.splice(sourceIndex, 1);
    newPointers.splice(destinationIndex, 0, dataPointers[draggableIndex]);

    setDataPointers(newPointers);
    handleStartLoading("Updating sequence! Please wait...");

    try {
      const response = await nodeService.post(
        `/api/${userId}/updatePointerSequence/${projectId}`,
        {
          pointerSequence: newPointers.map((newPointer) => newPointer.id),
        },
      );
      console.log(response.data.message);
      enqueueSnackbar(response.data.message, {
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        autoHideDuration: 3000,
        variant: "success",
      });
    } catch (error) {
      setDataPointers(dataPointers);
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

  const getProjectData = async () => {
    handleStartLoading("Loading project...");
    try {
      const response = await nodeService.get(
        `/api/${userId}/getProject/${projectId}`,
      );

      if (response.status === 200) {
        const {
          message,
          projectName,
          projectDescription,
          audioLanguage,
          voiceType,
          pointersCount,
          article,
          allOrderedPointers,
        } = response.data;
        console.log(message);
        setProjectName(projectName);
        setArticle(article);
        setAudioLanguage(audioLanguage);
        setVoiceType(voiceType);
        setPointersCount(pointersCount);
        setDataPointers(() =>
          allOrderedPointers.length > 0
            ? allOrderedPointers.map((orderedPointer) => ({
                ...orderedPointer,
                generateMedia: false,
              }))
            : null,
        );
        enqueueSnackbar(message, {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "success",
        });

        try {
          const response = await nodeService.get(
            `/api/${userId}/getProjectVideo/${projectId}`,
            {
              responseType: "blob",
            },
          );

          if (response.status === 200) {
            const videoBlob = new Blob([response.data], { type: "video/mp4" });
            const videoUrl = URL.createObjectURL(videoBlob);
            setGeneratedVideo(videoUrl);
            enqueueSnackbar("Video fetched successfully!", {
              anchorOrigin: { horizontal: "right", vertical: "bottom" },
              autoHideDuration: 3000,
              variant: "success",
            });
          }
        } catch (error) {
          setGeneratedVideo(null);
          if (error.response.status === 404)
            console.error("Video doesn't exist");
          else if (error.response.status === 500) {
            console.error("Error while fetching the video!");
            enqueueSnackbar("Error while fetching the video!", {
              anchorOrigin: { horizontal: "right", vertical: "bottom" },
              autoHideDuration: 3000,
              variant: "error",
            });
          }
        }
      }
    } catch (error) {
      setProjectName("");
      setArticle("");
      setAudioLanguage("english");
      setPointersCount(5);
      setDataPointers(null);
      setGeneratedVideo(null);
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

  const handleSelectAllPointersChange = (e) => {
    setDataPointers((prevDataPointers) =>
      prevDataPointers.map((dataPointer) => ({
        ...dataPointer,
        generateMedia: e.target.checked,
      })),
    );
  };

  const handleMediaTypesChange = (mediaType) => {
    setMediaTypes((prevMediaTypes) => ({
      ...prevMediaTypes,
      [mediaType]: !prevMediaTypes[mediaType],
    }));
  };

  const handleSelectPointerChange = (index) => {
    setDataPointers((prevDataPointers) =>
      prevDataPointers.map((dataPointer, idx) =>
        idx === index
          ? { ...dataPointer, generateMedia: !dataPointer.generateMedia }
          : dataPointer,
      ),
    );
  };

  useEffect(() => {
    const onStartGeneratingDataPointers = ({ targetProjectId }) => {
      if (targetProjectId === projectId)
        handleStartSocketLoading("Generating video inputs...");
    };
    const onGenerateDataPointers = ({ targetProjectId, pointers, message }) => {
      if (targetProjectId === projectId) {
        setDataPointers(() =>
          pointers.map((pointer) => ({ ...pointer, generateMedia: false })),
        );
        handleStopSocketLoading();
        enqueueSnackbar(message, {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "success",
        });
      }
    };

    const onStartGeneratingMedia = ({ targetProjectId }) => {
      if (targetProjectId === projectId)
        handleStartSocketLoading("Generating media...");
    };
    const onGenerateMedia = ({ targetProjectId, updatedPointers, message }) => {
      if (targetProjectId === projectId) {
        setDataPointers((prevDataPointers) => {
          return prevDataPointers.map((dataPointer) => {
            const updatedDataPointer = updatedPointers.find(
              (pointer) => pointer.id === dataPointer.id,
            );
            if (updatedDataPointer)
              return { ...updatedDataPointer, generateMedia: false };
            else return { ...dataPointer, generateMedia: false };
          });
        });
        setMediaTypes({
          audios: false,
          images: false,
        });
        handleStopSocketLoading();
        enqueueSnackbar(message, {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "success",
        });
      }
    };

    const onStartCreatingImage = ({ targetProjectId, creationType }) => {
      if (targetProjectId === projectId)
        handleStartSocketLoading(`${creationType} pointer image...`);
    };
    const onCreateImage = ({
      targetProjectId,
      targetPointerId,
      targetPointerImageName,
      message,
    }) => {
      if (targetProjectId === projectId) {
        setDataPointers((prevDataPointers) =>
          prevDataPointers.map((dataPointer) =>
            dataPointer.id === targetPointerId
              ? { ...dataPointer, imageName: targetPointerImageName }
              : dataPointer,
          ),
        );
        handleStopSocketLoading();
        enqueueSnackbar(message, {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "success",
        });
      }
    };

    const onStartGeneratingAudio = ({ targetProjectId }) => {
      if (targetProjectId === projectId)
        handleStartSocketLoading("Generating pointer audio...");
    };
    const onGenerateAudio = ({
      targetProjectId,
      targetPointerId,
      targetPointerAudioName,
      targetPointerAudioBuffer,
      message,
    }) => {
      if (targetProjectId === projectId) {
        setDataPointers((prevDataPointers) =>
          prevDataPointers.map((dataPointer) =>
            dataPointer.id === targetPointerId
              ? { ...dataPointer, audioName: targetPointerAudioName }
              : dataPointer,
          ),
        );
        handleStopSocketLoading();
        enqueueSnackbar(message, {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "success",
        });
        const generatedPointerAudioBlob = new Blob([targetPointerAudioBuffer], {
          type: "audio/mp3",
        });
        const generatedPointerAudio = new Audio(
          URL.createObjectURL(generatedPointerAudioBlob),
        );
        generatedPointerAudio.play();
      }
    };

    const onErrorHandler = ({ message }) => {
      handleStopSocketLoading();
      enqueueSnackbar(message, {
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        autoHideDuration: 3000,
        variant: "error",
      });
    };

    if (session?.user.id && projectId) {
      socket.connect();
      socket.on("connect", getProjectData);

      socket.on("generating-data-pointers", onStartGeneratingDataPointers);
      socket.on("generated-data-pointers", onGenerateDataPointers);

      socket.on("generating-media", onStartGeneratingMedia);
      socket.on("generated-media", onGenerateMedia);

      socket.on("generating-pointer-image", onStartCreatingImage);
      socket.on("generated-pointer-image", onCreateImage);

      socket.on("uploading-pointer-image", onStartCreatingImage);
      socket.on("uploaded-pointer-image", onCreateImage);

      socket.on("generating-pointer-audio", onStartGeneratingAudio);
      socket.on("generated-pointer-audio", onGenerateAudio);

      socket.on("error-generating-data-pointers", onErrorHandler);
      socket.on("error-generating-media", onErrorHandler);
      socket.on("error-generating-pointer-image", onErrorHandler);
      socket.on("error-uploading-pointer-image", onErrorHandler);
      socket.on("error-generating-pointer-audio", onErrorHandler);
    }
    return () => {
      if (session?.user.id && projectId) {
        socket.off("generating-data-pointers", onStartGeneratingDataPointers);
        socket.off("generated-data-pointers", onGenerateDataPointers);

        socket.off("generating-media", onStartGeneratingMedia);
        socket.off("generated-media", onGenerateMedia);

        socket.off("generating-pointer-image", onStartCreatingImage);
        socket.off("generated-pointer-image", onCreateImage);

        socket.off("uploading-pointer-image", onStartCreatingImage);
        socket.off("uploaded-pointer-image", onCreateImage);

        socket.off("generating-pointer-audio", onStartGeneratingAudio);
        socket.off("generated-pointer-audio", onGenerateAudio);

        socket.off("error-generating-data-pointers", onErrorHandler);
        socket.off("error-generating-media", onErrorHandler);
        socket.off("error-generating-pointer-image", onErrorHandler);
        socket.off("error-uploading-pointer-image", onErrorHandler);
        socket.off("error-generating-pointer-audio", onErrorHandler);

        socket.on("disconnect", getProjectData);
        socket.disconnect();
      }
    };
  }, [router.query, session?.user.id]);

  return (
    <Box my={8} minHeight="90vh" width="80%" mx="auto">
      <Typography
        variant="h5"
        textAlign="center"
        fontWeight={600}
        color="primary"
        sx={{
          marginBottom: ".3em",
          letterSpacing: ".04em",
          textTransform: "uppercase",
        }}
      >
        {projectName}
      </Typography>
      <Card
        raised
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "1em",
          marginInline: "auto",
          marginBottom: "2.5em",
        }}
      >
        <FormLabel color="info" sx={{ marginBottom: "1em" }}>
          Text to video generation
        </FormLabel>
        <Box
          display="flex"
          flexDirection={matches ? "column" : "row"}
          sx={{ marginBottom: "1em", position: "relative" }}
        >
          <FormControl
            sx={{
              flexGrow: 1,
              marginRight: "1em",
              width: matches && "100%",
              marginBottom: matches && "1em",
            }}
            size="small"
          >
            <InputLabel id="audio-language-select-label">
              Audio language
            </InputLabel>
            <Select
              labelId="audio-language-select-label"
              id="audio-language-select"
              value={audioLanguage}
              label="Audio language"
              onChange={handleAudioLanguageChange}
            >
              <MenuItem value="arabic">Arabic</MenuItem>
              <MenuItem value="chinese">Chinese</MenuItem>
              <MenuItem value="danish">Danish</MenuItem>
              <MenuItem value="dutch">Dutch</MenuItem>
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="french">French</MenuItem>
              <MenuItem value="german">German</MenuItem>
              <MenuItem value="hindi">Hindi</MenuItem>
              <MenuItem value="italian">Italian</MenuItem>
              <MenuItem value="japanese">Japanese</MenuItem>
              <MenuItem value="korean">Korean</MenuItem>
              <MenuItem value="nepali">Nepali</MenuItem>
              <MenuItem value="russian">Russian</MenuItem>
              <MenuItem value="spanish">Spanish</MenuItem>
              <MenuItem value="urdu">Urdu</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ flexGrow: 1, flexBasis: 0 }} size="small">
            <InputLabel id="pointers-count-select-label">
              Max no. of data pointers
            </InputLabel>
            <Select
              labelId="pointers-count-select-label"
              id="pointers-count-select"
              value={pointersCount}
              label="Max no. of data pointers"
              onChange={handlePointersCountChange}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((_, i) => (
                <MenuItem key={uuidv4()} value={`${i + 1}`}>
                  {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            sx={{
              position: "absolute",
              top: "-3em",
              right: "-1em",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <FormLabel
              id="demo-controlled-radio-buttons-group"
              sx={{ marginRight: ".5rem", marginTop: ".6rem" }}
            >
              Audio type:
            </FormLabel>
            <RadioGroup row value={voiceType} onChange={handleVoiceTypeChange}>
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <Textarea
          value={article}
          onChange={handleArticleChange}
          aria-label="article textarea"
          maxRows={7}
          minRows={7}
          placeholder="Please enter the article!"
          sx={{ width: "100%", marginBottom: "1em" }}
        />
        <Button
          onClick={handleGenerateDataPointers}
          sx={{ alignSelf: "flex-end", textTransform: "none" }}
          variant="contained"
        >
          <Typography mr={1}>Execute</Typography>
          <AutoAwesomeIcon />
        </Button>
      </Card>
      {dataPointers && (
        <Divider sx={{ marginBottom: "2.5em" }} variant="middle">
          Customize your video inputs
        </Divider>
      )}
      {dataPointers && (
        <Box position="relative">
          <FormGroup
            row
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2.5em",
              position: "sticky",
              top: "3.2em",
              backgroundColor: "#fff",
              zIndex: 1000,
              paddingBlock: ".6em",
            }}
          >
            <FormControlLabel
              label="Select all"
              control={
                <Checkbox
                  checked={selectedPointers.length === dataPointers.length}
                  indeterminate={
                    selectedPointers.length === dataPointers.length
                  }
                  onChange={handleSelectAllPointersChange}
                />
              }
            />
            <Box
              component="fieldset"
              color="primary"
              borderRadius={2}
              pl={2}
              pb={1}
              borderColor="#42a5f5"
            >
              <legend style={{ marginLeft: ".5em", color: "#42a5f5" }}>
                &nbsp;Generate&nbsp;
              </legend>
              <FormControlLabel
                checked={mediaTypes.audios}
                onChange={() => handleMediaTypesChange("audios")}
                control={<Checkbox />}
                label="Audios"
              />
              <FormControlLabel
                checked={mediaTypes.images}
                onChange={() => handleMediaTypesChange("images")}
                control={<Checkbox />}
                label="Images"
              />
            </Box>
          </FormGroup>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  {dataPointers.map((dataPointer, idx) => (
                    <Draggable
                      key={dataPointer.id}
                      draggableId={`${dataPointer.id}/${idx}`}
                      index={idx}
                    >
                      {(provided) => (
                        <Box
                          component="div"
                          mx="auto"
                          display="flex"
                          justifyContent="space-evenly"
                          marginBottom="2.5em"
                          position={matches && "relative"}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Box mt={1}>
                            <FormControlLabel
                              control={<Checkbox />}
                              onChange={() => handleSelectPointerChange(idx)}
                              checked={dataPointer.generateMedia}
                            />
                          </Box>
                          <VideoPointerConfig
                            index={idx}
                            dataPointer={dataPointer}
                            handleStartLoading={handleStartLoading}
                            handleStopLoading={handleStopLoading}
                            handleUpdateDataPointers={handleUpdateDataPointers}
                            handleAppendDataPointer={handleAppendDataPointer}
                            handleDeleteDataPointer={handleDeleteDataPointer}
                            handleRegenerateImage={handleRegenerateImage}
                            handleUploadNewImage={handleUploadNewImage}
                            handleUploadSearchedImage={
                              handleUploadSearchedImage
                            }
                          />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
          <Box
            component="div"
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "2.5em",
              position: "sticky",
              bottom: "1em",
            }}
          >
            {selectedPointers.length > 0 &&
            (mediaTypes.audios || mediaTypes.images) ? (
              <Button
                sx={{ textTransform: "none" }}
                variant="contained"
                onClick={handleGenerateMedia}
              >
                <Typography mr={1}>Generate media</Typography>
                <AutoAwesomeIcon />
              </Button>
            ) : (
              <Button
                sx={{ textTransform: "none" }}
                variant="contained"
                onClick={handleGenerateVideo}
              >
                <Typography mr={1}>Generate video</Typography>
                <AutoAwesomeIcon />
              </Button>
            )}
          </Box>
        </Box>
      )}
      {generatedVideo && dataPointers && (
        <>
          <Divider sx={{ marginBottom: "2.5em" }} variant="middle">
            Generated video
          </Divider>
          <Box
            component="div"
            mx="auto"
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{ width: "50vw" }}
          >
            <video controls style={{ width: "100%", marginBottom: "2.5em" }}>
              <source src={generatedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <Button
              sx={{ textTransform: "none" }}
              variant="contained"
              onClick={handleDownloadVideo}
            >
              <Typography>Download</Typography>
              <a ref={downloadVideoBtnRef} style={{ display: "none" }}></a>
            </Button>
          </Box>
        </>
      )}
      <Backdrop
        sx={{
          color: "#dee2e6",
          zIndex: 10000,
          backgroundColor: "rgba(0,0,0,.75)",
        }}
        open={isLoading || isSocketLoading}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h5" mb={8}>
            {loadingText || socketLoadingText}
          </Typography>
          <div class="custom-loader-text-to-video"></div>
        </Box>
      </Backdrop>
    </Box>
  );
}

const blue = {
  100: "#DAECFF",
  200: "#b6daff",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const Textarea = styled(BaseTextareaAutosize)(
  ({ theme }) => `
  box-sizing: border-box;
  width: 320px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${
    theme.palette.mode === "dark" ? grey[900] : grey[50]
  };

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${
      theme.palette.mode === "dark" ? blue[600] : blue[200]
    };
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);
