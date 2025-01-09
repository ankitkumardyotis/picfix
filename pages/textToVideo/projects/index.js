import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  List,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectWidget from "@/components/textToVideoGenerator/ProjectWidget";
import NewProjectDialogBox from "@/components/textToVideoGenerator/NewProjectDialogBox";
import ConfirmationDialogBox from "@/components/textToVideoGenerator/ConfirmationDialogBox";
import { useSession } from "next-auth/react";
import nodeService from "@/services/nodeService";
import { useSnackbar } from "notistack";
import Cookies from "js-cookie";
import axios from "axios";

function Projects() {
  const [projectList, setProjectList] = useState(null);
  const [openNewProjectDialogBox, setOpenNewProjectDialogBox] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [
    openDeleteProjectConfirmationDialogBox,
    setOpenDeleteProjectConfirmationDialogBox,
  ] = useState(false);
  const [deletedProjectId, setDeletedProjectId] = useState();
  const [userPlan, setUserPlan] = useState("");
  const [userPlanStatus, setUserPlanStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const projectsRef = useRef(null);
  const smBp = useMediaQuery("(min-width: 500px)");
  const mdBp = useMediaQuery("(min-width: 768px)");
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();

  const { data: session, status } = useSession();
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

  useEffect(() => {
    if (status === "loading") {
    } else if (!session) router.push("/login");
    else fetchUserPlan();
  }, [session, status, router]);

  const userId = session?.user.id;

  const handleNewProjectDialogBoxOpen = () => setOpenNewProjectDialogBox(true);
  const handleNewProjectDialogBoxClose = () => {
    setOpenNewProjectDialogBox(false);
    setNewProjectName("");
    setNewProjectDescription("");
  };

  const handleNewProjectNameChange = (e) => setNewProjectName(e.target.value);
  const handleNewProjectDescriptionChange = (e) =>
    setNewProjectDescription(e.target.value);

  const handleDeleteProjectConfirmationDialogBoxOpen = () =>
    setOpenDeleteProjectConfirmationDialogBox(true);
  const handleDeleteProjectConfirmationDialogBoxClose = () => {
    setDeletedProjectId(null);
    setOpenDeleteProjectConfirmationDialogBox(false);
  };

  const handleScrollToProjects = () => {
    const { top } = projectsRef.current.getBoundingClientRect();
    window.scrollBy({
      top,
      left: 0,
      behavior: "smooth",
    });
  };

  const handleDeletedProjectId = (projectId) => setDeletedProjectId(projectId);

  const handleAddNewProject = async () => {
    if (newProjectName === "") {
      alert("Project name cannot be empty!");
      return;
    }

    const newProject = {
      projectName: newProjectName,
      projectDescription: newProjectDescription,
    };

    handleNewProjectDialogBoxClose();
    setLoadingText("Creating project...");
    setIsLoading(true);
    try {
      const response = await nodeService.post(
        `/api/${userId}/create`,
        newProject,
      );

      if (response.status === 201) {
        const { newProject } = response.data;
        setProjectList((prevProjectList) => {
          const newProjectList = prevProjectList ? [...prevProjectList] : [];
          newProjectList.unshift(newProject);
          return newProjectList;
        });
        router.push(`/textToVideo/projects/${newProject.id}`);
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
    setIsLoading(false);
    setLoadingText("");
  };

  const handleDeleteProject = async () => {
    handleDeleteProjectConfirmationDialogBoxClose();
    setLoadingText("Deleting project...");
    setIsLoading(true);
    try {
      const response = await nodeService.delete(
        `/api/${userId}/delete/${deletedProjectId}`,
      );
      if (response.status === 200) {
        setProjectList((prevProjectList) =>
          prevProjectList.filter((project) => project.id !== deletedProjectId),
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
    setIsLoading(false);
    setLoadingText("");
  };

  async function getAllProjects() {
    setLoadingText("Loading...");
    setIsLoading(true);
    try {
      const response = await nodeService.get(`/api/${userId}/projects`);

      if (response.status === 200) setProjectList(response.data.reverse());
    } catch (error) {
      console.error(error.message);
      console.error(error.response.data.message);
      enqueueSnackbar(error.response.data.message, {
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        autoHideDuration: 3000,
        variant: "error",
      });
      setProjectList([]);
    }
    setIsLoading(false);
    setLoadingText("");
  }

  const handleJWTGenerate = async () => {
    const response = await axios.get("/api/jwt/getAccessToken");

    const { accessToken, refreshToken } = response.data;

    Cookies.set("access-token", accessToken, { secure: true, expires: 7 });
    Cookies.set("refresh-token", refreshToken, { secure: true, expires: 7 });
  };

  const getAllData = async () => {
    await handleJWTGenerate();
    await getAllProjects();
  };

  useEffect(() => {
    if (session) getAllData();
  }, [session]);

  if (
    userPlan?.remainingPoints === 0 ||
    userPlan?.remainingPoints < 0 ||
    userPlan === null
  ) {
    return router.push("/price");
  }

  return userPlanStatus ? (
    <Box
      minWidth="320px"
      sx={{
        background:
          "linear-gradient(59deg, rgba(100, 214, 207, 1) 0%, rgba(242, 212, 159, 1) 100%);",
      }}
    >
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Typography
          variant="h1"
          textAlign="center"
          fontSize={mdBp ? "4.5rem" : "3.2rem"}
          fontWeight={700}
        >
          Let{" "}
          <Box
            component="span"
            whiteSpace="nowrap"
            sx={{
              background:
                "linear-gradient(to right, hsl(280, 100%, 50%), hsl(325, 100%, 50%))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            AI Generate
          </Box>{" "}
          Videos from Your Text
        </Typography>
        <Typography
          my={mdBp ? 5 : 0}
          textAlign="center"
          variant="subtitle1"
          fontSize={mdBp ? "1.6rem" : "1.3rem"}
          fontWeight="500"
          sx={{
            color: "#0e0e0e",
            opacity: 0.5,
          }}
        >
          Unleash your creativity with our AI video wizard - where your stories
          <br />
          come alive in stunning visuals, no expertise needed!
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection={mdBp ? "row" : "column"}
        >
          <Box
            position="relative"
            sx={{
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "0%",
                height: "2px",
                background:
                  "linear-gradient(to right, hsl(280, 100%, 50%), hsl(325, 100%, 50%))",
                transition: "width 400ms 200ms",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "2px",
                height: "0%",
                background:
                  "linear-gradient(to bottom, hsl(280, 100%, 50%), hsl(325, 100%, 50%))",
                transition: "height 400ms 200ms",
              },
              "&:hover": {
                "&::before": {
                  width: "100%",
                },
                "&::after": {
                  height: "100%",
                },
              },
            }}
          >
            <Box
              p={2}
              position="relative"
              sx={{
                "&::before": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "0%",
                  height: "2px",
                  background:
                    "linear-gradient(to right, hsl(325, 100%, 50%), hsl(280, 100%, 50%))",
                  transition: "width 400ms 200ms",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "2px",
                  height: "0%",
                  background:
                    "linear-gradient(to bottom, hsl(325, 100%, 50%), hsl(280, 100%, 50%))",
                  transition: "height 400ms 200ms",
                },
                "&:hover": {
                  "&::before": {
                    width: "100%",
                  },
                  "&::after": {
                    height: "100%",
                  },
                },
              }}
            >
              <Button
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: mdBp ? 4 : 3,
                  textTransform: "none",
                  backgroundColor: "#000",
                  "&:hover": {
                    backgroundColor: "#000",
                    boxShadow:
                      "2px 2px 5px hsl(325, 100%, 50%), -2px -2px 5px hsl(280, 100%, 50%)",
                  },
                }}
                variant="contained"
                onClick={handleNewProjectDialogBoxOpen}
              >
                <Typography
                  variant="h5"
                  mr={1}
                  whiteSpace="nowrap"
                  fontSize={mdBp ? "1.5rem" : "1.3rem"}
                >
                  Generate new AI video
                </Typography>
                <AutoAwesomeIcon />
              </Button>
            </Box>
          </Box>
          {projectList && projectList.length > 0 && (
            <Button
              sx={{
                px: 2,
                py: 1,
                ml: mdBp && 5,
                borderRadius: mdBp ? 4 : 3,
                textTransform: "none",
                backgroundColor: "#000",
                "&:hover": {
                  backgroundColor: "#000",
                  boxShadow:
                    "2px 2px 5px hsl(325, 100%, 50%), -2px -2px 5px hsl(280, 100%, 50%)",
                },
              }}
              variant="contained"
              onClick={handleScrollToProjects}
            >
              <Typography
                variant="h5"
                mr={1}
                whiteSpace="nowrap"
                fontSize={mdBp ? "1.5rem" : "1.3rem"}
              >
                Explore Existing Projects
              </Typography>
            </Button>
          )}
        </Box>
        <NewProjectDialogBox
          openNewProjectDialogBox={openNewProjectDialogBox}
          newProjectName={newProjectName}
          newProjectDescription={newProjectDescription}
          handleNewProjectDialogBoxClose={handleNewProjectDialogBoxClose}
          handleNewProjectNameChange={handleNewProjectNameChange}
          handleNewProjectDescriptionChange={handleNewProjectDescriptionChange}
          handleAddNewProject={handleAddNewProject}
        />
      </Box>
      {projectList && projectList.length > 0 && (
        <Box
          ref={projectsRef}
          minHeight="100vh"
          display="flex"
          alignItems="center"
          flexDirection="column"
        >
          <Typography my={8} variant="h2" fontSize={mdBp ? "3rem" : "2rem"}>
            Your Projects
          </Typography>
          <List
            component="div"
            sx={{
              width: "80%",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              justifyItems: "center",
              alignItems: "center",
              rowGap: "3rem",
              columnGap: "3rem",
            }}
          >
            {projectList.map((project, idx) => (
              <ProjectWidget
                key={idx}
                projectId={project.id}
                projectName={project.projectName}
                handleDeletedProjectId={handleDeletedProjectId}
                handleDeleteProjectConfirmationDialogBoxOpen={
                  handleDeleteProjectConfirmationDialogBoxOpen
                }
              />
            ))}
            <ConfirmationDialogBox
              openConfirmationDialogBox={openDeleteProjectConfirmationDialogBox}
              handleConfirmationDialogBoxClose={
                handleDeleteProjectConfirmationDialogBoxClose
              }
              confirmationText="Do you really want to delete the project?"
              handler={handleDeleteProject}
            />
          </List>
        </Box>
      )}
      <Backdrop
        sx={{
          color: "#dee2e6",
          zIndex: 10000,
          backgroundColor: "rgba(0,0,0,.75)",
        }}
        open={isLoading}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant={smBp ? "h5" : "h6"} mb={8} textAlign="center">
            {loadingText}
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

export default Projects;
