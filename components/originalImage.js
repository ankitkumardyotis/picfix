import Image from 'next/image'
import React, { useState } from 'react'
import AppContext from './AppContext'
import { useContext } from 'react'
import { Height } from '@mui/icons-material';

function OriginalImage({ setIsImageLoaded, setOriginalImageHieght,setOriginalImageWidth }) {
  const context = useContext(AppContext);
  const [image, setImage] = useState(null);
  const imageStyle = {
    borderRadius: '5px',
    width: '100%',
    height: '100%',
    order: 1,
  };

  const handleFirstDivImageLoad = (event) => {
    // Update firstDivHeight with the height of the loaded image
    setOriginalImageHieght(event.target.offsetHeight);
    setOriginalImageWidth(event.target.offsetWidth )
  };

  return (
    <div style={{ padding: '0' }}>
      <Image src={context.fileUrl} alt="Original Pic" style={imageStyle}
        width={400} height={400}
        onLoad={handleFirstDivImageLoad}
        onLoadStart={() => setImage(false + "image is loading is started")}
        onLoadingComplete={() => setIsImageLoaded(true + "image is loading")}
        unoptimized
      />
    </div>
  )
}

export default OriginalImage