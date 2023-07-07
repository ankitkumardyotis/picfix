import * as React from 'react';
import { useRouter } from 'next/router'
import Image from 'next/image';
import { useContext } from 'react';
import AppContext from './AppContext';

export default function AllModelsContainer() {
  const context = useContext(AppContext);
  const router = useRouter();

  const handleRestoreImage = () => {
    router.push('/explorePages/restore')
  }
  const handleBlurImage = () => {
    router.push('/explorePages/colorization')
  }
  const handleRemoveBG = () => {
    router.push('/explorePages/bgRemove')
  }
  const handleTrendyLook = () => {
    router.push('/explorePages/fashion')
  }
  const handleRoomDesign = () => {
    router.push('/explorePages/room')
    context.setFileUrl('')
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
            <Image style={imageStyle} src="/assets/childColorization.jpg" alt="Picture of the author" width={300} height={250} />
          </div>
          <div className="card-info">
            <h3>
              Image Colorization
            </h3>
            <br />
            <p>
              The magic of AI image colorization work tirelessly to transform old pictures into New one.
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
        <div className="card" onClick={handleTrendyLook}>
          <div className="card-img">
            <Image style={imageStyle} src="/assets/models/trendyLookImage.jpg" alt="Picture of the author" width={300} height={250} />
          </div>
          <div className="card-info">
            <h3>
              Try Trendy look
            </h3>
            <br />
            <p>
              Effortlessly Change the color of cloth from any image and replace it with a new one of your choice.
            </p>
          </div>
        </div>
        <div className="card" onClick={handleRoomDesign}>
          <div className="card-img">
            <Image style={imageStyle} src="/assets/Dream-Room.png" alt="Picture of the author" width={300} height={250} />
          </div>
          <div className="card-info">
            <h3>
              Design Your Room
            </h3>
            <br />
            <p>
              Create your ideal room using and  Experience the future of home design with our advanced technology.
            </p>
          </div>
        </div>
      </div>
    </div >
  );
}