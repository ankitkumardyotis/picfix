import {
  Box,
  CircularProgress,
  List,
  ListItemButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectWidget from "@/components/textToVideoGenerator/ProjectWidget";
import NewProjectDialogBox from "@/components/textToVideoGenerator/NewProjectDialogBox";
import ConfirmationDialogBox from "@/components/textToVideoGenerator/ConfirmationDialogBox";
import { useSession } from "next-auth/react";
import nodeService from "@/services/nodeService";
import { useSnackbar } from "notistack";

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

  const handleDeletedProjectId = (projectId) => setDeletedProjectId(projectId);

  const handleAddNewProject = async () => {
    if (newProjectName === "" || newProjectDescription === "") {
      alert("Please fill the input fields");
      return;
    }

    const newProject = {
      projectName: newProjectName,
      projectDescription: newProjectDescription,
    };

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
        handleNewProjectDialogBoxClose();
        router.push(`/textToVideo/projects/${newProject.id}`);
        enqueueSnackbar(response.data.message, {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "success",
        });
      }
    } catch (error) {
      handleNewProjectDialogBoxClose();
      console.error(error.message);
      console.error(error.response.data.message);
      enqueueSnackbar(error.response.data.message, {
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        autoHideDuration: 3000,
        variant: "error",
      });
    }
  };

  const handleDeleteProject = async () => {
    try {
      const response = await nodeService.delete(
        `/api/${userId}/delete/${deletedProjectId}`,
      );
      if (response.status === 200) {
        setProjectList((prevProjectList) =>
          prevProjectList.filter((project) => project.id !== deletedProjectId),
        );
        handleDeleteProjectConfirmationDialogBoxClose();
        enqueueSnackbar(response.data.message, {
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
          autoHideDuration: 3000,
          variant: "success",
        });
      }
    } catch (error) {
      console.error(error.message);
      console.error(error.response.data.message);
      handleDeleteProjectConfirmationDialogBoxClose();
      enqueueSnackbar(error.response.data.message, {
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        autoHideDuration: 3000,
        variant: "error",
      });
    }
  };

  async function getAllProjects() {
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
  }

  useEffect(() => {
    if (session?.user.id) getAllProjects();
  }, [session?.user.id]);

  if (
    userPlan?.remainingPoints === 0 ||
    userPlan?.remainingPoints < 0 ||
    userPlan === null
  ) {
    return router.push("/price");
  }

  return userPlanStatus ? (
    <Box
      paddingTop="5rem"
      paddingBottom="4rem"
      minHeight="100vh"
      display="flex"
      alignItems="center"
      flexDirection="column"
      sx={{
        background:
          "linear-gradient(59deg, rgba(100, 214, 207, 1) 0%, rgba(242, 212, 159, 1) 100%);",
      }}
    >
      <Typography
        variant="h2"
        textAlign="center"
        sx={{
          fontSize: "3rem",
          fontWeight: "700",
        }}
      >
        Text to Video generation
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontWeight: "500",
          color: " #0e0e0e",
        }}
      >
        Words come alive
      </Typography>
      <List
        component="div"
        sx={{
          width: "80%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          justifyItems: "center",
          alignItems: "center",
          gap: "3em",
          marginTop: "2rem",
        }}
      >
        <Box
          sx={{
            width: "100px",
            height: "100px",
          }}
        >
          <ListItemButton
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              position: "relative",
              borderRadius: ".5em",
              border: "2px solid #0e0e0e",
              boxShadow:
                "0 1px 0 #0e0e0e, 0 2px 0 #0e0e0e, 0 3px 0 #0e0e0e, 0 4px 0 #0e0e0e, 0 5px 0 #0e0e0e, 0 3px 1px rgba(0,0,0,.1), 0 0 2.5px rgba(0,0,0,.1), 0 .5px 1.5px rgba(0,0,0,.3), 0 1.5px 2.5px rgba(0,0,0,.2), 0 2.5px 5px rgba(0,0,0,.25), 0 5px 5px rgba(0,0,0,.2), 0 10px 10px rgba(0,0,0,.15)",
            }}
            onClick={handleNewProjectDialogBoxOpen}
          >
            <AddIcon htmlColor="#000" fontSize="large" />
          </ListItemButton>
          <Typography textAlign="center" mt={1} sx={{ color: "#000" }}>
            New
          </Typography>
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
        {projectList &&
          projectList.map((project, idx) => (
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
  ) : (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1em",
        flexDirection: "column",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default Projects;
