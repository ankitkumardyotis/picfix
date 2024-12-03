import {
  Box,
  IconButton,
  ListItemButton,
  Tooltip,
  Typography,
} from "@mui/material";
import MovieIcon from '@mui/icons-material/Movie';
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useRouter } from "next/router";

function ProjectWidget({
  projectId,
  projectName,
  handleDeletedProjectId,
  handleDeleteProjectConfirmationDialogBoxOpen,
}) {
  const [isWidgetHovered, setIsWidgetHovered] = useState(false);
  const router = useRouter();

  const handleOpenExistingProject = () => {
    router.push(`/textToVideo/projects/${projectId}`);
  };

  return (
    <Box
      sx={{
        width: "100px",
        height: "100px",
        position: "relative",
      }}
      onMouseOver={() => setIsWidgetHovered(true)}
      onMouseOut={() => setIsWidgetHovered(false)}
      onClick={handleOpenExistingProject}
    >
      <ListItemButton
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          height: "100%",
          borderRadius: ".5em",
          border: "1px solid #1565c0",
          boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
        }}
      >
        <MovieIcon htmlColor="#1565c0" fontSize="large" />
        <Tooltip title={projectName} arrow zoom followCursor>
          <Typography textAlign="center" mt={1}>
            {projectName.length > 6
              ? `${projectName.substring(0, 6)}...`
              : projectName}
          </Typography>
        </Tooltip>
      </ListItemButton>
      <IconButton
        size="small"
        color="error"
        sx={{
          visibility: isWidgetHovered ? "visible" : "hidden",
          position: "absolute",
          backgroundColor: "#FFF",
          "&: hover": {
            backgroundColor: "rgba(220,220,220)",
          },
          top: "-.8em",
          right: "-.8em",
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleDeletedProjectId(projectId);
          handleDeleteProjectConfirmationDialogBoxOpen();
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default ProjectWidget;
