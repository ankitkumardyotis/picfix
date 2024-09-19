import {
  Box,
  Card,
  IconButton,
  ListItemButton,
  Tooltip,
  Typography,
} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
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
        width: "150px",
        height: "150px",
        position: "relative",
      }}
      onMouseOver={() => setIsWidgetHovered(true)}
      onMouseOut={() => setIsWidgetHovered(false)}
      onClick={handleOpenExistingProject}
    >
      <Card
        sx={{
          height: "100%",
          padding: 0,
        }}
      >
        <ListItemButton
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            borderRadius: "inherit",
          }}
        >
          <FolderOutlinedIcon htmlColor="#1565c0" fontSize="large" />
        </ListItemButton>
        <Tooltip title={projectName} arrow zoom followCursor>
          <Typography textAlign="center">
            {projectName.length > 6
              ? `${projectName.substring(0, 6)}...`
              : projectName}
          </Typography>
        </Tooltip>
      </Card>
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
