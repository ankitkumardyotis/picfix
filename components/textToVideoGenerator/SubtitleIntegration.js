import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card,
  CardContent,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SubtitleConfig from './SubtitleConfig';

/**
 * This component serves as a guide on how to integrate 
 * the subtitle configuration feature into the existing application.
 */
export default function SubtitleIntegration() {
  const [subtitleConfigOpen, setSubtitleConfigOpen] = useState(false);
  const [subtitleConfig, setSubtitleConfig] = useState({
    position: "bottom",
    fontFamily: "Arial",
    fontSize: 16,
    fontColor: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.5)",
    bold: false,
    italic: false,
    underline: false,
    textAlign: "center",
    borderColor: "transparent",
    borderWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
  });

  const handleSubtitleConfigOpen = () => {
    setSubtitleConfigOpen(true);
  };

  const handleSubtitleConfigClose = () => {
    setSubtitleConfigOpen(false);
  };

  const handleSubtitleConfigUpdate = (newConfig) => {
    setSubtitleConfig(newConfig);
    console.log('Subtitle configuration updated:', newConfig);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Subtitle Configuration Integration Guide
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Interactive Demo
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
          {/* Mock video player for demonstration */}
          <Box 
            sx={{ 
              width: '100%', 
              maxWidth: 600, 
              height: 320, 
              bgcolor: '#000',
              position: 'relative',
              mb: 2
            }}
          >
            {/* Sample video content */}
            <Box 
              sx={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
            >
              <Typography variant="body1" color="white">
                Video Content
              </Typography>
            </Box>
            
            {/* Subtitle display area */}
            <Box 
              sx={{
                position: "absolute",
                bottom: subtitleConfig.position === "bottom" ? 20 : "auto",
                top: subtitleConfig.position === "top" ? 20 : 
                     subtitleConfig.position === "middle" ? "50%" : "auto",
                left: 0,
                right: 0,
                transform: subtitleConfig.position === "middle" ? "translateY(-50%)" : "none",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 2,
                textAlign: subtitleConfig.textAlign,
                px: 2,
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
                  border: `${subtitleConfig.borderWidth}px solid ${subtitleConfig.borderColor}`,
                  padding: `${subtitleConfig.paddingVertical}px ${subtitleConfig.paddingHorizontal}px`,
                  maxWidth: "90%",
                  borderRadius: 1,
                }}
              >
                Sample subtitle text
              </Box>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SubtitlesIcon />}
            onClick={handleSubtitleConfigOpen}
            sx={{ mt: 2 }}
          >
            Configure Subtitles
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Current Configuration:
        </Typography>
        
        <Box 
          component="pre" 
          sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            overflowX: 'auto',
            maxHeight: 200,
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: 4,
            },
          }}
        >
          {JSON.stringify(subtitleConfig, null, 2)}
        </Box>
      </Paper>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Integration Steps
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="1. Add the SubtitleConfig component to your VideoPlayer" 
                secondary="Import and add the SubtitleConfig dialog component inside your VideoPlayer component"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="2. Add subtitle-related state in VideoPlayer" 
                secondary="Add state for subtitleConfig and subtitleConfigOpen to manage dialog visibility and configuration"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="3. Add a button to open the configuration dialog" 
                secondary="Add a button with the SubtitlesIcon in your video controls toolbar"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="4. Add handlers for the dialog and configuration updates" 
                secondary="Implement functions to handle opening/closing the dialog and updating the configuration"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="5. Apply subtitle styles to your subtitles container" 
                secondary="Use the configuration properties to style the container for your subtitles"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="6. Create a backend API endpoint" 
                secondary="Implement an API endpoint to save the subtitle configuration to your database"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h5" display="flex" alignItems="center" gutterBottom>
            <CodeIcon sx={{ mr: 1 }} /> Code Snippet Example
          </Typography>
          
          <Box 
            component="pre" 
            sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1, 
              overflowX: 'auto',
              fontSize: '0.875rem',
              '&::-webkit-scrollbar': {
                width: 8,
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: 4,
              },
            }}
          >
{`// In VideoPlayer.js

// 1. Import the SubtitleConfig component
import SubtitleConfig from "./SubtitleConfig";

function VideoPlayer({ generatedVideo, videoName, projectId, dataPointerId }) {
  // 2. Add subtitle-related state
  const [subtitleConfigOpen, setSubtitleConfigOpen] = useState(false);
  const [subtitleConfig, setSubtitleConfig] = useState({
    position: "bottom",
    fontFamily: "Arial",
    fontSize: 16,
    fontColor: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.5)",
    // ... other properties
  });
  
  // 3. Add handlers for the dialog and configuration updates
  const handleSubtitleConfigOpen = () => {
    setSubtitleConfigOpen(true);
  };
  
  const handleSubtitleConfigClose = () => {
    setSubtitleConfigOpen(false);
  };
  
  const handleSubtitleConfigUpdate = (newConfig) => {
    setSubtitleConfig(newConfig);
  };

  return (
    <Box>
      {/* Video player content */}
      
      {/* 4. Add subtitle display area */}
      <Box 
        sx={{
          position: "absolute",
          bottom: subtitleConfig.position === "bottom" ? 20 : "auto",
          // ... other positioning styles based on configuration
        }}
      >
        <Box
          sx={{
            backgroundColor: subtitleConfig.backgroundColor,
            color: subtitleConfig.fontColor,
            // ... other styles based on configuration
          }}
        >
          Subtitle text goes here
        </Box>
      </Box>
      
      {/* Controls bar */}
      <Box>
        {/* 5. Add button to open configuration dialog */}
        <IconButton onClick={handleSubtitleConfigOpen}>
          <SubtitlesIcon />
        </IconButton>
        
        {/* Other controls */}
      </Box>
      
      {/* 6. Add the SubtitleConfig component */}
      <SubtitleConfig
        open={subtitleConfigOpen}
        handleClose={handleSubtitleConfigClose}
        projectId={projectId}
        dataPointerId={dataPointerId}
        currentSubtitleConfig={subtitleConfig}
        handleSubtitleConfigUpdate={handleSubtitleConfigUpdate}
      />
    </Box>
  );
}`}
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
            <InfoIcon color="info" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Note: You'll need to create a backend API endpoint to save the subtitle configuration to your database.
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      {/* The actual SubtitleConfig component */}
      <SubtitleConfig
        open={subtitleConfigOpen}
        handleClose={handleSubtitleConfigClose}
        projectId="demo-project"
        dataPointerId="demo-pointer"
        currentSubtitleConfig={subtitleConfig}
        handleSubtitleConfigUpdate={handleSubtitleConfigUpdate}
      />
    </Box>
  );
} 