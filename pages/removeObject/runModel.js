import AppContext from '@/components/AppContext';
import MaskEditor from '@/components/MaskEditor/MaskEditor';
import ImageComponent from '@/components/imageComponent';
import Uploader from '@/components/uploadContainerbase64/Uploader';
import { Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect, useContext } from 'react';

export default function Home() {

  const [brushSize, setBrushSize] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [restorePhoto, setRestoredPhoto] = useState('');
  const [maskedImageUrl, setMaskedImageUrl] = useState('');
  const [isShowUploader, setIsShowUploader] = useState(true);
  const canvasRef = useRef(null);
  const maskRef = useRef(null);
  const context = useContext(AppContext);
  const fileUrl = context.fileUrl;
  const setFileUrl = context.setFileUrl;
  const [userPlan, setUserPlan] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userPlanStatus, setUserPlanStatus] = useState(false);
  const fetchUserPlan = async () => {
    try {
      const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch plan data');
      }
      const data = await response.json();
      setUserPlan(data.plan)
      setUserPlanStatus(true)
    } catch (error) {
      console.error('Error fetching plan data:', error);
    }
  };

  useEffect(() => {
    if (status === "loading") {
    } else if (!session) router.push("/login");
    // else fetchUserPlan();
  }, [session, status, router]);


  useEffect(() => {
    if (imageSrc) {
      setFileUrl(imageSrc)
    }
  }, imageSrc)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cropUploadedImage, setcropUploadedImage] = useState(false);
  const [loadCircularProgress, setLoadCircularProgress] = useState(false);

  const generatePhoto = async (maskedImage) => {
    try {
      const res = await fetch("/api/replicatePredictionWebhook/getPrediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: imageSrc, apiName: 'object-remove', maskedImageUrl: maskedImage }),
      });
      if (!res.ok) {
        throw new Error('Failed to generate photo');
      }
      const result = await res.json();
      const replicateImageId = result.id;
      let webhookDBResponse;

      while (!webhookDBResponse) {
        const response = await fetch(`/api/replicatePredictionWebhook/getImageFromDB?replicateId=${replicateImageId}`);
        if (response.status === 200) {
          const data = await response.json();
          webhookDBResponse = data;
          if (data.webhookData.output[0]) {

            // if (userPlan) {

            //   const response = await fetch(`/api/dataFetchingDB/updateData?userId=${session?.user.id}`);
            //   const newCreditpoints = await response.json();
            //   context.setCreditPoints(newCreditpoints.saveCreditPoint.remainingPoints)
            //   if (!response.ok) {
            //     throw new Error('Failed to fetch plan data');
            //   }
            const history = await fetch('/api/dataFetchingDB/updateHistory', {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: session.user.id,
                model: data.webhookData.model,
                status: data.webhookData.status,
                createdAt: data.webhookData.created_at,
                replicateId: data.webhookData.id
              }),

            });
            //   if (!history.ok) {
            //     throw new Error('Failed to fetch plan data');
            //   }
            // }

            setRestoredPhoto(data.webhookData.output[0]);
            setError(null);
            setLoading(false)
          }
        } else {
          if (timerForRunModelRef.current > 98) {
            await fetch(`/api/replicatePredictionWebhook/cancelPrediction?replicateId=${replicateImageId}`);
            setError("true");
            setLoadCircularProgress(true);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error generating photo==>', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNewImages = () => {
    setImageSrc(null)
    setIsDrawing(false)
    setFileUrl('')
    setMaskedImageUrl('')
    setRestoredPhoto('')
  }

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

  const handleRemoveObject = () => {
    setIsShowUploader(false)
    setLoading(true);
    setFileUrl(imageSrc);

    const maskCanvas = maskRef.current;
    let base64image = maskCanvas.toDataURL('image/png');
    setMaskedImageUrl(base64image);
    if (base64image) generatePhoto(base64image);
    setImageSrc(null)
    setBrushSize(5);
    setMaskedImageUrl('')

  };

  const { timerForRunModel } = useContext(AppContext);
  const timerForRunModelRef = useRef(timerForRunModel);
  useEffect(() => {
    timerForRunModelRef.current = timerForRunModel;
  }, [timerForRunModel]);

  return (
    <div className='aiModels' style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >

      <Typography variant="h2" sx={{ paddingTop: "30px", fontSize: "3rem", fontWeight: "700", marginBottom: "5px", color: " #000", lineHeight: "50px", textAlign: "center", }}>
        Remove Objects
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: "500", marginBottom: "5px", color: " #0e0e0e", textAlign: "center", }}>
        Upload an Image and see magic
      </Typography>


      {!imageSrc && isShowUploader && <Uploader handleImageUpload={handleImageUpload} />}
      {!restorePhoto && <MaskEditor canvasRef={canvasRef}
        maskRef={maskRef}
        fileUrl={fileUrl}
        isShowUploader={isShowUploader}
        handleRemoveObject={handleRemoveObject}
        isDrawing={isDrawing} setIsDrawing={setIsDrawing}
        imageSrc={imageSrc} setImageSrc={setImageSrc}
        brushSize={brushSize} setBrushSize={setBrushSize}
        restorePhoto={restorePhoto} setRestoredPhoto={setRestoredPhoto}
        maskedImageUrl={maskedImageUrl} setMaskedImageUrl={setMaskedImageUrl}
        handleUploadNewImages={handleUploadNewImages}
      />}

      {
        fileUrl && !imageSrc && < ImageComponent setError={setError} setLoadCircularProgress={setLoadCircularProgress} loadCircularProgress={loadCircularProgress} setFileUrl={setFileUrl} cropUploadedImage={cropUploadedImage} fileUrl={fileUrl} restoredPhoto={restorePhoto} setRestoredPhoto={setRestoredPhoto} loading={loading} setLoading={setLoading} error={error} />
      }

      {imageSrc &&
        <div style={{ display: 'flex', gap: '1em' }}>
          <button style={styles.downloadButton} onClick={handleUploadNewImages}>
            Re-Upload image
          </button>
          <button style={styles.downloadButton} onClick={handleRemoveObject}>
            Remove Object
          </button>
        </div>
      }
    </div>
  );
}


const styles = {
  downloadButton: {
    backgroundColor: "#000",
    color: "white",
    border: "none",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background - color 0.3s ease",
  }
}