import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, Container } from '@mui/material';
import { useRouter } from 'next/router'
import Image from 'next/image';

export default function AllModelsContainer() {
  const router = useRouter();

  const handleRestoreImage = () => {
    router.push('/AIModels/restorePhoto')
  }
  const handleBlurImage = () => {
    router.push('/AIModels/motionBlur')
  }
  const handleRemoveBG = () => {
    router.push('/AIModels/removeBG')
  }
  const imageStyle = {
    borderRadius: '5px 5px 0px 0px',
    width: '100%',
    height: '100%'
  }

  return (
    
    <div className='modelContainer'>
      <div className='allCardContainer flex-container'>
        <div className="card" onClick={handleRestoreImage}>
          <div className="card-img">
            <Image style={imageStyle} src="/assets/girlImg.jpg" alt="Picture of the author" width={300} height={250} />
          </div>
          <div className="card-info">
            <h3>
              Restore Photo
            </h3>
            <br />
            <p>
             Restore the old quality of your images. Whether you have faded family photographs, vintage snapshots, etc.
            </p>
          </div>
        </div>
        <div className="card" onClick={handleBlurImage}>
          <div className="card-img">
            <Image style={imageStyle} src="/assets/blurry-roads.jpg" alt="Picture of the author" width={300} height={250} />
          </div>
          <div className="card-info">
            <h3>
              Blurry Image
            </h3>
            <br />
            <p>
            The magic of AI image restoration work tirelessly to transform blurry pictures into New one.
            </p>
          </div>
        </div>
        <div className="card" onClick={handleRemoveBG}>
          <div className="card-img">
            <Image style={imageStyle} src="/assets/remove-background.jpg" alt="Picture of the author" width={300} height={250} />
          </div>
          <div className="card-info">
            <h3>
              Remove Background
            </h3>
            <br />
            <p>
            Effortlessly remove the background from any image and replace it with a new one of your choice.
            </p>
          </div>
        </div>
      </div>
    </div >
  );
}