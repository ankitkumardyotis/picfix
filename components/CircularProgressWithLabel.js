import * as React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AppContext from './AppContext';

function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress size={60} sx={{ color: 'black' }} variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" fontSize={15} sx={{ color: 'black' }} component="div" color="text.secondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
};

export default function CircularWithValueLabel() {
  const [progress, setProgress] = React.useState(1);
  const { timerForRunModel, setTimerForRunModel } = React.useContext(AppContext);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress >= 100 ? 0 : prevProgress + 1;
        setTimerForRunModel(newProgress);
        return newProgress;
      });
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setTimerForRunModel]);

  return <CircularProgressWithLabel value={progress} />;
}
