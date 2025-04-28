import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Slider,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  useTheme,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import TextDecreaseIcon from "@mui/icons-material/TextDecrease";
import { useSnackbar } from "notistack";
import nodeService from "@/services/nodeService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`subtitle-tabpanel-${index}`}
      aria-labelledby={`subtitle-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SubtitleConfig({ 
  open, 
  handleClose, 
  projectId, 
  dataPointerId, 
  currentSubtitleConfig, 
  handleSubtitleConfigUpdate 
}) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Subtitle configuration state
  const [subtitleConfig, setSubtitleConfig] = useState({
    position: currentSubtitleConfig?.position || "bottom",
    fontFamily: currentSubtitleConfig?.fontFamily || "Arial",
    fontSize: currentSubtitleConfig?.fontSize || 16,
    fontColor: currentSubtitleConfig?.fontColor || "#FFFFFF",
    backgroundColor: currentSubtitleConfig?.backgroundColor || "rgba(0,0,0,0.5)",
    bold: currentSubtitleConfig?.bold || false,
    italic: currentSubtitleConfig?.italic || false,
    underline: currentSubtitleConfig?.underline || false,
    textAlign: currentSubtitleConfig?.textAlign || "center",
    borderColor: currentSubtitleConfig?.borderColor || "transparent",
    borderWidth: currentSubtitleConfig?.borderWidth || 0,
    paddingVertical: currentSubtitleConfig?.paddingVertical || 8,
    paddingHorizontal: currentSubtitleConfig?.paddingHorizontal || 16,
  });

  useEffect(() => {
    if (currentSubtitleConfig) {
      setSubtitleConfig(currentSubtitleConfig);
    }
  }, [currentSubtitleConfig]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStyleChange = (property) => {
    setSubtitleConfig({
      ...subtitleConfig,
      [property]: !subtitleConfig[property]
    });
  };

  const handleInputChange = (property, value) => {
    setSubtitleConfig({
      ...subtitleConfig,
      [property]: value
    });
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      // API call to save subtitle configuration
 
      // Update parent component state
      if (handleSubtitleConfigUpdate) {
        handleSubtitleConfigUpdate(subtitleConfig);
      }
      
      enqueueSnackbar("Subtitle configuration saved successfully!", {
        variant: "success",
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
      });
      
      handleClose();
    } catch (error) {
      console.error("Error saving subtitle configuration:", error);
      enqueueSnackbar("Failed to save subtitle configuration", {
        variant: "error",
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
      });
    } finally {
      setLoading(false);
    }
  };

  // Preview component for subtitles
  const SubtitlePreview = () => (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        height: 150,
        position: "relative",
        backgroundColor: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: subtitleConfig.position === "top" ? "flex-start" : 
                    subtitleConfig.position === "bottom" ? "flex-end" : "center",
        padding: 2,
        mb: 3,
      }}
    >
      <Box
        sx={{
          backgroundColor: subtitleConfig.backgroundColor,
          color: subtitleConfig.fontColor,
          fontFamily: subtitleConfig.fontFamily,
          fontSize: `${subtitleConfig.fontSize}px`,
          fontWeight: subtitleConfig.bold ? "bold" : "normal",
          fontStyle: subtitleConfig.italic ? "italic" : "normal",
          textDecoration: subtitleConfig.underline ? "underline" : "none",
          textAlign: subtitleConfig.textAlign,
          border: `${subtitleConfig.borderWidth}px solid ${subtitleConfig.borderColor}`,
          padding: `${subtitleConfig.paddingVertical}px ${subtitleConfig.paddingHorizontal}px`,
          maxWidth: "90%",
        }}
      >
        Preview Subtitle Text
      </Box>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "60vh",
        },
      }}
    >
      <DialogTitle>
        Subtitle Configuration
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <SubtitlePreview />
        
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" centered>
          <Tab label="Position & Layout" />
          <Tab label="Typography" />
          <Tab label="Colors" />
          <Tab label="Advanced" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Position</InputLabel>
                <Select
                  value={subtitleConfig.position}
                  label="Position"
                  onChange={(e) => handleInputChange("position", e.target.value)}
                >
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                  <MenuItem value="middle">Middle</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Text Alignment</InputLabel>
                <Select
                  value={subtitleConfig.textAlign}
                  label="Text Alignment"
                  onChange={(e) => handleInputChange("textAlign", e.target.value)}
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Horizontal Padding</Typography>
              <Slider
                value={subtitleConfig.paddingHorizontal}
                min={0}
                max={50}
                step={1}
                onChange={(e, newValue) => handleInputChange("paddingHorizontal", newValue)}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Vertical Padding</Typography>
              <Slider
                value={subtitleConfig.paddingVertical}
                min={0}
                max={30}
                step={1}
                onChange={(e, newValue) => handleInputChange("paddingVertical", newValue)}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={subtitleConfig.fontFamily}
                  label="Font Family"
                  onChange={(e) => handleInputChange("fontFamily", e.target.value)}
                >
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Helvetica">Helvetica</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Courier New">Courier New</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                  <MenuItem value="Impact">Impact</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Font Size ({subtitleConfig.fontSize}px)</Typography>
              <Slider
                value={subtitleConfig.fontSize}
                min={8}
                max={72}
                step={1}
                onChange={(e, newValue) => handleInputChange("fontSize", newValue)}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 1, my: 2 }}>
                <IconButton 
                  color={subtitleConfig.bold ? "primary" : "default"}
                  onClick={() => handleStyleChange("bold")}
                >
                  <FormatBoldIcon />
                </IconButton>
                <IconButton 
                  color={subtitleConfig.italic ? "primary" : "default"}
                  onClick={() => handleStyleChange("italic")}
                >
                  <FormatItalicIcon />
                </IconButton>
                <IconButton 
                  color={subtitleConfig.underline ? "primary" : "default"}
                  onClick={() => handleStyleChange("underline")}
                >
                  <FormatUnderlinedIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleInputChange("fontSize", Math.min(72, subtitleConfig.fontSize + 2))}
                >
                  <TextIncreaseIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleInputChange("fontSize", Math.max(8, subtitleConfig.fontSize - 2))}
                >
                  <TextDecreaseIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Font Color</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    border: "1px solid #ccc",
                    backgroundColor: subtitleConfig.fontColor,
                  }}
                />
                <TextField
                  type="color"
                  value={subtitleConfig.fontColor}
                  onChange={(e) => handleInputChange("fontColor", e.target.value)}
                  fullWidth
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Background Color</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    border: "1px solid #ccc",
                    backgroundColor: subtitleConfig.backgroundColor,
                  }}
                />
                <TextField
                  type="color"
                  value={subtitleConfig.backgroundColor.startsWith("rgba") 
                    ? "#000000" // Default for RGBA values which color picker can't handle
                    : subtitleConfig.backgroundColor}
                  onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                  fullWidth
                />
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                For transparent background, use the Advanced tab
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Background Opacity</Typography>
              <Slider
                value={parseFloat(subtitleConfig.backgroundColor.match(/rgba\(.*,\s*([\d.]+)\)/) 
                  ? subtitleConfig.backgroundColor.match(/rgba\(.*,\s*([\d.]+)\)/)[1] 
                  : 1)}
                min={0}
                max={1}
                step={0.1}
                onChange={(e, newValue) => {
                  const bgColor = subtitleConfig.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
                    ? `rgba(${bgColor[1]}, ${bgColor[2]}, ${bgColor[3]}, ${newValue})`
                    : `rgba(0, 0, 0, ${newValue})`;
                  handleInputChange("backgroundColor", bgColor);
                }}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Border Color</Typography>
              <TextField
                type="color"
                value={subtitleConfig.borderColor === "transparent" ? "#000000" : subtitleConfig.borderColor}
                onChange={(e) => handleInputChange("borderColor", e.target.value)}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Border Width ({subtitleConfig.borderWidth}px)</Typography>
              <Slider
                value={subtitleConfig.borderWidth}
                min={0}
                max={10}
                step={1}
                onChange={(e, newValue) => handleInputChange("borderWidth", newValue)}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Custom CSS (Advanced)"
                multiline
                rows={4}
                fullWidth
                placeholder="Enter custom CSS properties"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSaveConfig} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Save Configuration"}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 