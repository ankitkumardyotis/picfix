import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { TextareaAutosize as BaseTextareaAutosize } from "@mui/base/TextareaAutosize";
import { styled } from "@mui/system";

function NewProjectDialogBox({
  openNewProjectDialogBox,
  newProjectName,
  newProjectDescription,
  handleNewProjectDialogBoxClose,
  handleNewProjectNameChange,
  handleNewProjectDescriptionChange,
  handleAddNewProject,
}) {
  const smBp = useMediaQuery("(min-width: 500px)");

  return (
    <Dialog
      open={openNewProjectDialogBox}
      onClose={handleNewProjectDialogBoxClose}
      fullScreen={!smBp}
    >
      <DialogTitle textAlign="center">New Project</DialogTitle>
      <DialogContent
        sx={{ display: smBp || "flex", flexDirection: smBp || "column" }}
      >
        <TextField
          value={newProjectName}
          onChange={handleNewProjectNameChange}
          size="small"
          label="Project name"
          fullWidth
          sx={{ my: 2 }}
        />
        <Textarea
          value={newProjectDescription}
          onChange={handleNewProjectDescriptionChange}
          maxRows={6}
          minRows={6}
          placeholder="Please enter the project description!"
          sx={{ width: "100%", flexGrow: 1, letterSpacing: 0.8 }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          sx={{
            backgroundColor: "#000",
            "&: hover": {
              backgroundColor: "#000",
            },
          }}
          variant="contained"
          onClick={handleAddNewProject}
        >
          Create
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleNewProjectDialogBoxClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewProjectDialogBox;

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
