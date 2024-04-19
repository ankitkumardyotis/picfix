import * as React from 'react';
import { useRouter } from 'next/router'
import Image from 'next/image';
import { useContext } from 'react';
import AppContext from './AppContext';

export default function AllModelsContainer() {
  const context = useContext(AppContext);
  const router = useRouter();

  const handleRestoreImage = () => {
    router.push('/restorePhoto')
    context.setFileUrl('')
    localStorage.setItem('path', '/restorePhoto')
  }
  const handleBlurImage = () => {
    context.setFileUrl('')
    router.push('/imageColorization')
    localStorage.setItem('path', '/imageColorization')

  }
  const handleRemoveBG = () => {
    context.setFileUrl('')
    router.push('/backgroundRemoval')
    localStorage.setItem('path', '/backgroundRemoval')

  }
  const handleTrendyLook = () => {
    context.setFileUrl('')
    router.push('/trendyLook')
    localStorage.setItem('path', '/trendyLook')
  }
  const handleRoomDesign = () => {
    context.setFileUrl('')
    router.push('/aiHomeMakeover')
    localStorage.setItem('path', '/aiHomeMakeover')
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
            <Image style={imageStyle} src="/assets/girlImg1.jpg" alt="Picture of the author" width={400} height={300} />
          </div>
          <div className="card-info">
            <h2>
              Restore Photo
            </h2>
            <br />
            <p>
              Restore the former quality of your images by reviving faded family photographs, vintage snapshots, and more through our image restoration service.
            </p>
          </div>
        </div>
        <div className="card" onClick={handleBlurImage}>
          <div className="card-img">
            <Image style={imageStyle} src="/assets/Hedy lammar image-colorization 1200X300.jpg" alt="Picture of the author" width={400} height={300} />
          </div>
          <div className="card-info">
            <h2>
              Image Colorization
            </h2>
            <br />
            <p>
              Revive old memories with vibrant colors using AI colorization. Transform photographs into vivid representations, preserving beauty and nostalgia.
            </p>
          </div>
        </div>
        <div className="card" style={{ position: 'relative' }} onClick={handleRemoveBG}>
          {/* <div className="ribbon">Free</div> */}
          <div class="ribbon right"><h6 style={{fontSize:'28px'}}>Free</h6></div>
          <div className="card-img ">
            <Image style={imageStyle} src="/assets/remove-background.jpg" alt="Picture of the author" width={400} height={300} />
          </div>
          <div className="card-info">
            <h2>
              Background Removal
            </h2>
            <br />
            <p>
              Effortlessly remove the background from any image using our advanced background removal tool. <br /><br />
            </p>
          </div>
        </div>
        <div className="card" onClick={handleTrendyLook}>
          <div className="card-img">
            <Image style={imageStyle} src="/assets/models/trendyLookImage.jpg" alt="Picture of the author" width={400} height={300} />
          </div>
          <div className="card-info">
            <h2>
              Try Trendy look
            </h2>
            <br />
            <p>
              Elevate your social media with AI-generated fashion enhancements. Embrace trends, captivate followers with personalized style modifications.
            </p>
          </div>
        </div>
        <div className="card" onClick={handleRoomDesign}>
          <div className="card-img">
            <Image style={imageStyle} src="/assets/Dream-Room.jpg" alt="Picture of the author" width={400} height={300} />
          </div>
          <div className="card-info">
            <h2>
              AI Home Makeover
            </h2>
            <br />
            <p>
              Experience the future of home design with our AI-powered solution. Transform your spaces effortlessly, adding beauty and style to every corner of your home.
            </p>
          </div>
        </div>
      </div>
    </div >
  );
}