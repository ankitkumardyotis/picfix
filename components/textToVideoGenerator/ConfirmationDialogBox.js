import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Typography,
} from "@mui/material";

function ConfirmationDialogBox({
  openConfirmationDialogBox,
  handleConfirmationDialogBoxClose,
  confirmationText,
  handler,
}) {
  return (
    <Dialog
      open={openConfirmationDialogBox}
      onClose={handleConfirmationDialogBoxClose}
    >
      <DialogContent>
        <Typography>{confirmationText}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handler}>
          Yes
        </Button>
        <Button variant="contained" onClick={handleConfirmationDialogBoxClose}>
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialogBox;
