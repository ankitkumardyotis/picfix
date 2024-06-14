import React, { useRef, useState, useEffect } from 'react';
import styles from './MaskEditor.module.css';
import Uploader from '../uploadContainerbase64/Uploader';

const MaskEditor = ({
  canvasRef,
  maskRef,
  handleRemoveObject,
  isDrawing, setIsDrawing, fileUrl,
  imageSrc, setImageSrc,isShowUploader,
  brushSize, setBrushSize, restorePhoto, setRestoredPhoto, maskedImageUrl, setMaskedImageUrl,
  handleUploadNewImages
}) => {
  // const [brushSize, setBrushSize] = useState(10);
  // const [isDrawing, setIsDrawing] = useState(false);
  // const [imageSrc, setImageSrc] = useState(null);
  // const [restorePhoto, setRestoredPhoto] = useState('');
  // const [maskedImageUrl, setMaskedImageUrl] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  // const canvasRef = useRef(null);
  // const maskRef = useRef(null);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const maxWidth = window.innerWidth * 0.5; // 50vw
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const aspectRatio = height / width;
          width = maxWidth;
          height = maxWidth * aspectRatio;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, width, height);

        const maskCanvas = maskRef.current;
        maskCanvas.width = img.width;  // Keep original image dimensions
        maskCanvas.height = img.height;
        const maskContext = maskCanvas.getContext('2d');
        maskContext.fillStyle = 'black';
        maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        setImageDimensions({ width: img.width, height: img.height }); // Store original dimensions
      };
    }
  }, [imageSrc]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    draw(offsetX, offsetY, true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    const maskContext = maskRef.current.getContext('2d');
    maskContext.beginPath();
  };


  // const handleUploadNewImages = () => {
  //   setImageSrc(null)
  //   setIsDrawing(false)
  // }

  const draw = (x, y, isStart = false) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskRef.current;
    const scaleX = maskCanvas.width / canvas.width;
    const scaleY = maskCanvas.height / canvas.height;
    const context = canvas.getContext('2d');
    const maskContext = maskCanvas.getContext('2d');

    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    if (isStart) {
      context.beginPath();
      maskContext.beginPath();
    }

    context.fillStyle = 'lightgreen';
    context.strokeStyle = 'lightgreen';
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);

    maskContext.fillStyle = 'white';
    maskContext.strokeStyle = 'white';
    maskContext.lineWidth = brushSize * scaleX;
    maskContext.lineCap = 'round';
    maskContext.lineTo(scaledX, scaledY);
    maskContext.stroke();
    maskContext.beginPath();
    maskContext.moveTo(scaledX, scaledY);
  };

  const handleMouseMove = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    if (isDrawing) {
      draw(offsetX, offsetY);
    }
    const cursorCanvas = canvasRef.current;
    cursorCanvas.style.cursor = `url('data:image/svg+xml;base64,${btoa(`
      <svg height="${brushSize}" width="${brushSize}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${brushSize / 2}" cy="${brushSize / 2}" r="${brushSize / 2}" fill="darkgreen" />
      </svg>
    `)}') ${brushSize / 2} ${brushSize / 2}, auto`;
  };


  return (
    <div className={styles.maskContainer}>
      {/* {!imageSrc && isShowUploader && <Uploader handleImageUpload={handleImageUpload} />} */}
      {imageSrc && !restorePhoto && (
        <>
          <div className={styles.controlsTool}>
            <label htmlFor="brushSize">Brush Size: </label>
            <input
              type="range"
              id="brushSize"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(e.target.value)}
            />
          </div>
          <div className={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={endDrawing}
              onMouseMove={handleMouseMove}
              onMouseLeave={endDrawing}
              style={{
                cursor: 'crosshair',
                display: imageSrc ? 'block' : 'none',
                width: '100%',
                height: 'auto',
              }}
            />
            <canvas ref={maskRef} style={{ display: 'none' }} />
          </div>
        </>
      )}
      {/* {
        restorePhoto && <>
          <img src={restorePhoto} alt="hubhb" style={{ width: '10rem', height: '10rem' }} />
        </>
      } */}
      {/* {imageSrc &&
        <div style={{ display: 'flex', gap: '1em' }}>
          <button className={styles.downloadButton} onClick={handleUploadNewImages}>
            Re-Upload image
          </button>
          <button className={styles.downloadButton} onClick={handleRemoveObject}>
            Remove Object
          </button>
        </div>
      } */}
    </div>
  );
};

export default MaskEditor;
