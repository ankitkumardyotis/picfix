import React from 'react';
import { Box, Button, CircularProgress, LinearProgress, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MovieCreationIcon from '@mui/icons-material/MovieCreation';

const ESTIMATE_SECONDS = 300; // The usual time a video takes (4 to 5 minutes)

const formatElapsed = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

// Lists the videos that are still being made, with a button to check on them.
// Videos are made on our servers, so it is safe to leave or refresh the page.
const RunningVideos = ({ videos, checking, onCheck, minimumWait }) => {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!videos.length) return null;

  return (
    <Box
      role="status"
      sx={{
        mb: 2.5,
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(156, 39, 176, 0.25)',
        background: 'linear-gradient(135deg, rgba(233,30,99,0.06), rgba(103,58,183,0.08))',
        boxShadow: '0 4px 18px rgba(103, 58, 183, 0.10)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', p: { xs: 2, sm: 2.5 } }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #e91e63, #673ab7)',
            '@keyframes pulseRing': {
              '0%': { boxShadow: '0 0 0 0 rgba(233,30,99,0.45)' },
              '70%': { boxShadow: '0 0 0 12px rgba(233,30,99,0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(233,30,99,0)' },
            },
            animation: 'pulseRing 1.8s ease-out infinite',
          }}
        >
          <MovieCreationIcon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>
            {videos.length === 1 ? 'Your video is being made' : `${videos.length} videos are being made`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usually {minimumWait || '4 to 5 minutes'}. You can leave or refresh this page.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={onCheck}
          disabled={checking}
          startIcon={checking ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            background: 'linear-gradient(135deg, #e91e63, #673ab7)',
            '&:hover': { background: 'linear-gradient(135deg, #d81b60, #5e35b1)' },
          }}
        >
          {checking ? 'Checking...' : 'Check status'}
        </Button>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {videos.map((video) => {
          const elapsedMs = now - video.startedAt;
          const percent = Math.min(95, (elapsedMs / 1000 / ESTIMATE_SECONDS) * 100);
          const longer = elapsedMs / 1000 > ESTIMATE_SECONDS;
          return (
            <Box key={video.id} sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, mb: 1 }}>
                <Typography variant="body2" noWrap sx={{ minWidth: 0, fontWeight: 500 }}>
                  {video.prompt || 'Video'}
                </Typography>
                <Typography variant="body2" sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}>
                  {formatElapsed(elapsedMs)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(103,58,183,0.12)',
                  '& .MuiLinearProgress-bar': { borderRadius: 3, background: 'linear-gradient(90deg, #e91e63, #673ab7)' },
                }}
              />
              {longer && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  Taking a little longer than usual. Please check again in a minute.
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default RunningVideos;
