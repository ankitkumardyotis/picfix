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
  CircularProgress,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import nodeService from "@/services/nodeService";
import { useSnackbar } from "notistack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VideoPointerConfig from "@/components/textToVideoGenerator/VideoPointerConfig";
import { socket } from "@/socket";
import VideoPlayer from "@/components/textToVideoGenerator/VideoPlayer";
import VideoSettingsIcon from "@mui/icons-material/VideoSettings";
import Cookies from "js-cookie";

export default function Page() {
  const router = useRouter();
  const { projectId } = router.query;

  const { data: session, status } = useSession();
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
  const [userPlan, setUserPlan] = useState("");
  const [userPlanStatus, setUserPlanStatus] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState();
  const [scrolledToTop, setScrolledToTop] = useState(false);
  const [isGenerateBtnHidden, setIsGenerateBtnHidden] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(true);
  const [isSelectBarHidden, setIsSelectBarHidden] = useState(false);
  const [dataPointersGenerated, setDataPointersGenerated] = useState(false);
  const [isVideoGenerated, setIsVideoGenerated] = useState(false);
  const [currentDataPointerAudio, setCurrentDataPointerAudio] = useState();
  const [websocketInstance, setWebsocketInstance] = useState();
  const firstDividerRef = useRef(null);
  const secondDividerRef = useRef(null);
  const selectBarRef = useRef(null);
  const generateBtnRef = useRef(null);
  const xsBp = useMediaQuery("(min-width: 335px)");
  const smBp = useMediaQuery("(min-width: 500px)");
  const mdBp = useMediaQuery("(min-width: 768px)");

  const { enqueueSnackbar } = useSnackbar();

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

    handleStartLoading();
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
              ? {
                  ...updatedPointer,
                  generateMedia: false,
                  isAudioPlaying: false,
                }
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
    handleStopLoading();
  };

  const handleRegenerateImage = async (targetDataPointerId, prompt) => {
    if (prompt === "") {
      alert("Custom prompt cannot be empty!");
      return;
    }

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

  const handleUploadNewImage = (event, targetDataPointerId) => {
    return new Promise((resolve) => {
      handleStartLoading();
      const file = event.target.files[0];

      if (file.size > 4000000) {
        handleStopLoading();
        enqueueSnackbar("Image is too large", {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "error",
        });
        resolve();
        return;
      }

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
              const { message, targetPointerImageName } = response.data;
              console.log(message);
              setDataPointers((prevDataPointers) =>
                prevDataPointers.map((dataPointer) =>
                  dataPointer.id === targetDataPointerId
                    ? { ...dataPointer, imageName: targetPointerImageName }
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
          handleStopLoading();
          resolve();
        };
      }
    });
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
        const { message, targetPointerImageName } = response.data;
        console.log(message);
        setDataPointers((prevDataPointers) =>
          prevDataPointers.map((dataPointer) =>
            dataPointer.id === dataPointerId
              ? { ...dataPointer, imageName: targetPointerImageName }
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
      );

      if (response.status === 200) {
        const { videoUrl, message } = response.data;
        setGeneratedVideo(videoUrl);
        setIsVideoGenerated(true);
        enqueueSnackbar(message, {
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

  const handleAppendDataPointer = async (index) => {
    handleStartLoading();
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
            generateMedia: false,
            isAudioPlaying: false,
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
    handleStopLoading();
  };

  const handleDeleteDataPointer = async (targetDataPointerId) => {
    handleStartLoading();
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
    handleStopLoading();
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
                isAudioPlaying: false,
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
          );

          if (response.status === 200) {
            const { videoUrl, message } = response.data;
            setGeneratedVideo(videoUrl);
            enqueueSnackbar(message, {
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

  const handleCurrentDataPointerAudio = (audioUrl) => {
    const audioObject = audioUrl ? new Audio(audioUrl) : null;
    setCurrentDataPointerAudio(audioObject);
  };

  const fetchUserPlan = async () => {
    try {
      const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch plan data");
      }
      const data = await response.json();
      setUserPlan(data.plan);
      setUserPlanStatus(true);
    } catch (error) {
      console.error("Error fetching plan data:", error);
    }
  };

  const handlePlayPauseDataPointer = (targetDataPointerId) => {
    setDataPointers((prevDataPointers) =>
      prevDataPointers.map((dataPointer) =>
        dataPointer.id === targetDataPointerId
          ? { ...dataPointer, isAudioPlaying: !dataPointer.isAudioPlaying }
          : { ...dataPointer, isAudioPlaying: false },
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
          pointers.map((pointer) => ({
            ...pointer,
            generateMedia: false,
            isAudioPlaying: false,
          })),
        );
        handleStopSocketLoading();
        setDataPointersGenerated(true);
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
      message,
    }) => {
      if (targetProjectId === projectId) {
        setDataPointers((prevDataPointers) =>
          prevDataPointers.map((dataPointer) =>
            dataPointer.id === targetPointerId
              ? {
                  ...dataPointer,
                  audioName: targetPointerAudioName,
                }
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

    const onErrorHandler = ({ message }) => {
      handleStopSocketLoading();
      enqueueSnackbar(message, {
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        autoHideDuration: 3000,
        variant: "error",
      });
    };

    if (process.env.NODE_ENV === "development") {
      if (session?.user.id && projectId) {
        socket.disconnect();
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

          socket.off("connect", getProjectData);
          socket.on("disconnect", getProjectData);
          socket.off("disconnect", getProjectData);
          socket.disconnect();
        }
      };
    } else {
      if (session?.user.id && projectId) {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_API_URL);
        setWebsocketInstance(ws);
        ws.onopen = () => {
          console.log("WebSocket connection established");
          const accessToken = Cookies.get("access-token");
          ws.send(
            JSON.stringify({
              type: "authenticate",
              accessToken,
              userId: session.user.id,
            }),
          );
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          const { type, statusCode, message } = data;
          if (statusCode === 401 || statusCode === 403) router.push("/login");
          else if (type === "authorized") getProjectData();
          else {
            if (type === "generating-data-pointers")
              onStartGeneratingDataPointers({
                targetProjectId: data.targetProjectId,
              });
            else if (type === "generated-data-pointers")
              onGenerateDataPointers({
                targetProjectId: data.targetProjectId,
                pointers: data.pointers,
                message,
              });
            else if (type === "generating-pointer-image")
              onStartCreatingImage({
                targetProjectId: data.targetProjectId,
                creationType: data.creationType,
              });
            else if (type === "generated-pointer-image")
              onCreateImage({
                targetProjectId: data.targetProjectId,
                targetPointerId: data.targetPointerId,
                targetPointerImageName: data.targetPointerImageName,
                message,
              });
            else if (type === "generating-pointer-audio")
              onStartGeneratingAudio({ targetProjectId: data.targetProjectId });
            else if (type === "generated-pointer-audio")
              onGenerateAudio({
                targetProjectId: data.targetProjectId,
                targetPointerId: data.targetPointerId,
                targetPointerAudioName: data.targetPointerAudioName,
                targetPointerAudioUrl: data.targetPointerAudioUrl,
                message,
              });
            else if (type === "generating-media")
              onStartGeneratingMedia({ targetProjectId: data.targetProjectId });
            else if (type === "generated-media")
              onGenerateMedia({
                targetProjectId: data.targetProjectId,
                updatedPointers: data.updatedPointers,
                message,
              });
            else if (
              type === "error-generating-data-pointers" ||
              type === "error-generating-pointer-image" ||
              type === "error-uploading-pointer-image" ||
              type === "error-generating-pointer-audio" ||
              type === "error-generating-media"
            )
              onErrorHandler({ message });
          }
        };

        ws.onclose = () => {
          console.log("WebSocket connection closed");
        };

        return () => ws.close();
      }
    }
  }, [router.query, session?.user.id]);

  useEffect(() => {
    if (status === "loading") {
    } else if (!session) router.push("/login");
    else fetchUserPlan();
  }, [session, status, router]);

  useEffect(() => {
    if (window.innerWidth >= 320 && window.innerWidth <= 500)
      setIsGenerateBtnHidden(true);

    const handleScroll = () => {
      if (selectBarRef.current) {
        const { top } = selectBarRef.current.getBoundingClientRect();
        if (top === 52) setScrolledToTop(true);
        else setScrolledToTop(false);

        if (
          window.innerWidth >= 320 &&
          window.innerWidth <= 500 &&
          top >= window.innerHeight - 150
        )
          setIsGenerateBtnHidden(true);
        else setIsGenerateBtnHidden(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [selectBarRef.current]);

  useEffect(() => {
    const handleScroll = () => {
      if (generateBtnRef.current) {
        const { bottom } = generateBtnRef.current.getBoundingClientRect();
        if (
          parseInt(bottom) === window.innerHeight ||
          parseInt(bottom) + 1 === window.innerHeight
        )
          setScrolledToBottom(true);
        else setScrolledToBottom(false);

        if (parseInt(bottom) < 200) setIsSelectBarHidden(true);
        else setIsSelectBarHidden(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [generateBtnRef.current]);

  useEffect(() => {
    if (dataPointersGenerated) {
      const { top } = firstDividerRef.current.getBoundingClientRect();
      window.scrollBy({
        top: top - 60,
        left: 0,
        behavior: "smooth",
      });
      setDataPointersGenerated(false);
    }
  }, [dataPointersGenerated]);

  useEffect(() => {
    if (isVideoGenerated) {
      const { top } = secondDividerRef.current.getBoundingClientRect();
      window.scrollBy({
        top: top - 100,
        left: 0,
        behavior: "smooth",
      });
      setIsVideoGenerated(false);
    }
  }, [isVideoGenerated]);

  // if (
  //   userPlan?.remainingPoints === 0 ||
  //   userPlan?.remainingPoints < 0 ||
  //   userPlan === null
  // ) {
  //   return router.push("/price");
  // }

  return userPlanStatus ? (
    <Box
      mx="auto"
      my={8}
      minHeight="100vh"
      minWidth="320px"
      maxWidth="1300px"
      px={2}
    >
      <Typography
        variant="h5"
        textAlign="center"
        fontWeight="bold"
        color="primary"
        mb={1}
        letterSpacing={1}
        textTransform="uppercase"
      >
        {projectName}
      </Typography>
      <Card
        raised
        sx={{
          backgroundColor: smBp || "#74c69d",
          p: 2,
          mb: smBp ? 5 : 3,
          display: "flex",
          flexDirection: "column",
          height: smBp || "calc(100vh - 120px)",
        }}
      >
        <Box
          display="flex"
          justifyContent={smBp ? "space-between" : "center"}
          alignItems="center"
          mb={1}
        >
          {smBp && (
            <FormControl>
              <FormLabel>Text to video generation</FormLabel>
            </FormControl>
          )}
          <FormControl
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <FormLabel
              sx={{
                mr: 1,
                whiteSpace: "nowrap",
                color: smBp || "#000",
                fontWeight: smBp || "bold",
              }}
            >
              Audio type:
            </FormLabel>
            <RadioGroup
              sx={{ flexWrap: "nowrap" }}
              row
              value={voiceType}
              onChange={handleVoiceTypeChange}
            >
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box display="flex" flexDirection={smBp ? "row" : "column"} mb={2}>
          <FormControl
            sx={{
              flexGrow: 1,
              flexBasis: 0,
              mr: smBp && 2,
              mb: !smBp && 2,
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
              sx={{ backgroundColor: smBp || "#b7e4c7" }}
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
              sx={{ backgroundColor: smBp || "#b7e4c7" }}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((_, i) => (
                <MenuItem key={uuidv4()} value={`${i + 1}`}>
                  {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Textarea
          value={article}
          onChange={handleArticleChange}
          placeholder="Please enter the article!"
          maxRows={7}
          minRows={7}
          sx={{
            width: "100%",
            mb: 2,
            flexGrow: 1,
            letterSpacing: 0.8,
          }}
        />
        <Button
          onClick={handleGenerateDataPointers}
          sx={{
            textTransform: "none",
            alignSelf: smBp && "flex-end",
            backgroundColor: smBp || "#000",
            "&:hover": {
              backgroundColor: smBp || "#000",
            },
          }}
          variant="contained"
        >
          <Typography mr={1}>Execute</Typography>
          <AutoAwesomeIcon />
        </Button>
      </Card>
      {dataPointers && dataPointers.length > 0 && (
        <>
          <Divider sx={{ mb: smBp ? 5 : 3 }} ref={firstDividerRef}>
            <Typography variant="subtitle1" display="flex" alignItems="center">
              <VideoSettingsIcon
                fontSize="medium"
                sx={{ mr: 1 }}
                color="primary"
              />
              Customize your video inputs
              <VideoSettingsIcon
                fontSize="medium"
                sx={{ ml: 1 }}
                color="primary"
              />
            </Typography>
          </Divider>
          <Box
            ref={selectBarRef}
            sx={{
              boxShadow: scrolledToTop && "0 2px 5px rgba(0,0,0,0.2)",
              p: scrolledToTop && 1,
              mb: smBp ? 5 : 3,
              mx: "auto",
              position: "sticky",
              top: 52,
              width: scrolledToTop ? (xsBp ? "300px" : "200px") : "100%",
              backgroundColor: "#FFF",
              backgroundImage:
                scrolledToTop &&
                "linear-gradient(59deg,rgba(100, 214, 207, 1) 0%,rgba(242, 212, 159, 1) 100%);",
              zIndex: 1000,
              borderRadius: 2,
              borderTopLeftRadius: scrolledToTop && 0,
              borderTopRightRadius: scrolledToTop && 0,
              visibility: isSelectBarHidden ? "hidden" : "visible",
            }}
          >
            <FormGroup
              row
              sx={{
                flexDirection: scrolledToTop
                  ? xsBp
                    ? "row"
                    : "column"
                  : smBp
                  ? "row"
                  : "column",
                alignItems: scrolledToTop
                  ? "center"
                  : smBp
                  ? "center"
                  : "flex-start",
              }}
            >
              <FormControlLabel
                label="Select all"
                sx={{ m: 0, whiteSpace: "nowrap" }}
                control={
                  <Checkbox
                    checked={selectedPointers.length === dataPointers.length}
                    indeterminate={
                      selectedPointers.length === dataPointers.length
                    }
                    onChange={handleSelectAllPointersChange}
                    sx={{ m: 0, p: 0 }}
                  />
                }
              />
              <Box
                component="fieldset"
                borderRadius={2}
                pl={2}
                pb={1}
                borderColor={scrolledToTop ? "#000" : "#42a5f5"}
                mt={scrolledToTop ? (xsBp ? -1 : 1) : smBp ? -1 : 3}
                ml={scrolledToTop ? "auto" : smBp ? "auto" : "unset"}
                whiteSpace="nowrap"
              >
                <legend
                  style={{
                    color: scrolledToTop ? "#000" : "#42a5f5",
                  }}
                >
                  &nbsp;Generate&nbsp;
                </legend>
                <FormControlLabel
                  checked={mediaTypes.audios}
                  onChange={() => handleMediaTypesChange("audios")}
                  control={
                    scrolledToTop ? (
                      <Checkbox sx={{ m: 0, p: 0 }} />
                    ) : (
                      <Checkbox />
                    )
                  }
                  label="Audios"
                />
                <FormControlLabel
                  checked={mediaTypes.images}
                  onChange={() => handleMediaTypesChange("images")}
                  control={
                    scrolledToTop ? (
                      <Checkbox sx={{ m: 0, p: 0 }} />
                    ) : (
                      <Checkbox />
                    )
                  }
                  label="Images"
                />
              </Box>
            </FormGroup>
          </Box>
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
                          mt={mdBp ? 0 : 7}
                          mb={5}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          position={mdBp ? "static" : "relative"}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <VideoPointerConfig
                            index={idx}
                            dataPointer={dataPointer}
                            currentDataPointerAudio={currentDataPointerAudio}
                            websocketInstance={websocketInstance}
                            handleSelectPointerChange={
                              handleSelectPointerChange
                            }
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
                            handleCurrentDataPointerAudio={
                              handleCurrentDataPointerAudio
                            }
                            handlePlayPauseDataPointer={
                              handlePlayPauseDataPointer
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
            ref={generateBtnRef}
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: smBp ? 5 : 3,
              position: "sticky",
              bottom: 0,
              zIndex: 1000,
              visibility: isGenerateBtnHidden ? "hidden" : "visible",
            }}
          >
            <Box
              sx={{
                boxShadow: scrolledToBottom && "0 -2px 5px rgba(0,0,0,0.2)",
                p: scrolledToBottom && 1,
                backgroundImage:
                  scrolledToBottom &&
                  "linear-gradient(59deg,rgba(100, 214, 207, 1) 0%,rgba(242, 212, 159, 1) 100%);",
                borderRadius: scrolledToBottom && 2,
                borderBottomLeftRadius: scrolledToBottom && 0,
                borderBottomRightRadius: scrolledToBottom && 0,
              }}
            >
              <Button
                sx={{
                  textTransform: "none",
                  backgroundColor: scrolledToBottom && "#000",
                  "&:hover": {
                    backgroundColor: scrolledToBottom && "#000",
                  },
                }}
                variant="contained"
                color="primary"
                onClick={() => {
                  if (
                    selectedPointers.length > 0 &&
                    (mediaTypes.audios || mediaTypes.images)
                  )
                    handleGenerateMedia();
                  else handleGenerateVideo();
                }}
              >
                <Typography mr={1}>
                  {selectedPointers.length > 0 &&
                  (mediaTypes.audios || mediaTypes.images)
                    ? "Generate media"
                    : "Generate video"}
                </Typography>
                <AutoAwesomeIcon />
              </Button>
            </Box>
          </Box>
        </>
      )}
      {generatedVideo && (
        <>
          <Divider ref={secondDividerRef} sx={{ mb: smBp ? 5 : 3 }}>
            <Typography variant="subtitle1" display="flex" alignItems="center">
              <VideoSettingsIcon
                fontSize="medium"
                sx={{ mr: 1 }}
                color="primary"
              />
              Generated video
              <VideoSettingsIcon
                fontSize="medium"
                sx={{ ml: 1 }}
                color="primary"
              />
            </Typography>
          </Divider>
          <VideoPlayer
            generatedVideo={generatedVideo}
            videoName={projectName}
          />
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
          <Typography variant={smBp ? "h5" : "h6"} mb={8} textAlign="center">
            {loadingText || socketLoadingText}
          </Typography>
          <div class="custom-loader-text-to-video"></div>
        </Box>
      </Backdrop>
    </Box>
  ) : (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeContent: "center",
      }}
    >
      <CircularProgress />
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
