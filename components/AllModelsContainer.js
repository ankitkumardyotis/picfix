import * as React from 'react';
import { useRouter } from 'next/router'
import Image from 'next/image';
import { useContext } from 'react';
import AppContext from './AppContext';
import { useInView } from 'react-intersection-observer';
import { Fade } from 'react-awesome-reveal';
import { Zoom } from '@mui/material';

export default function AllModelsContainer() {
  const context = useContext(AppContext);
  const router = useRouter();
  const [checked, setChecked] = React.useState(false);


  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5
  })
  React.useEffect(() => {
    setChecked(true)
  }, [inView])

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
  const handleObjectRemove = () => {
    context.setFileUrl('')
    router.push('/removeObject')
    localStorage.setItem('path', '/object-remover')
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

    <div className='modelContainer' ref={ref}>
      <div className='allCardContainer flex-container'>
        {inView && <Zoom in={checked} style={{ transitionDelay: checked ? '100ms' : '0ms' }}>

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
        </Zoom>}
        {inView && <Zoom in={checked} style={{ transitionDelay: checked ? '150ms' : '0ms' }}>
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
        </Zoom>}
        {inView && <Zoom in={checked} style={{ transitionDelay: checked ? '200ms' : '0ms' }}>
          <div className="card" style={{ position: 'relative' }} onClick={handleRemoveBG}>
            {/* <div className="ribbon">Free</div> */}
            <div class="ribbon right"><h6 style={{ fontSize: '28px' }}>Free</h6></div>
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
        </Zoom>}
        {inView && <Zoom in={checked} style={{ transitionDelay: checked ? '400ms' : '0ms' }}>
          <div className="card" onClick={handleObjectRemove}>
            <div className="card-img">
              <Image style={imageStyle} src="/assets/models/remove-object-picfix-pic-landing-page.png" alt="Picture of the author" width={400} height={300} />
            </div>
            <div className="card-info">
              <h2>
                Remove Objects
              </h2>
              <br />
              <p>
                Effortlessly remove unwanted objects from your photos. Achieve a clean, professional look with just a few clicks. Perfect for creating flawless, polished images.            </p>
            </div>
          </div>
        </Zoom>}

        {inView && <Zoom in={checked} style={{ transitionDelay: checked ? '500ms' : '0ms' }}>
          <div className="card" onClick={handleRoomDesign} >
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
        </Zoom>}
      </div>
    </div >
  );
}