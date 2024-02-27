import { Box, Container, Grid, Typography, useMediaQuery } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import { useTheme } from '@mui/material/styles';

function ImageStrip({ setLoading, setRestoredPhoto, restoreImageURLForVarient, imageColorizationOne, imageColorization, imageColorizationTwo, imageColorizationThree, imageColorizationFour }) {

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    //   <Container maxWidth='xl' >
    //   <div className="imageAfterAllProcess">

    //     <div className="coloredImage">
    //       <Image src={restoreImageURLForVarient} onClick={() => { setRestoredPhoto(restoreImageURLForVarient),  console.log("starting load") }} alt='Restored Image 1' unoptimized  style={{ width: '100%', height: '100%', cursor: 'pointer' }} width={100} height={100}/>
    //     </div>



    //     <div className="coloredImage">
    //       <Image src={imageColorization} onClick={() => { setRestoredPhoto(imageColorization),  console.log("starting load") }} alt='Restored Image 1' unoptimized  style={{ width: '100%', height: '100%', cursor: 'pointer' }}  width={100} height={100}/>
    //     </div>


    //     <div className="coloredImage">
    //       <Image src={imageColorizationOne} onClick={() => { setRestoredPhoto(imageColorizationOne),  console.log("starting load") }} alt='Restored Image 2' unoptimized  style={{ width: '100%', height: '100%', cursor: 'pointer' }}  width={100} height={100} />
    //     </div>


    //     <div className="coloredImage">
    //       <Image src={imageColorizationTwo} onClick={() => { setRestoredPhoto(imageColorizationTwo),  console.log("starting load") }} alt='Restored Image 3' unoptimized  style={{ width: '100%', height: '100%', cursor: 'pointer' }}  width={100} height={100} />
    //     </div>

    //     <div className="coloredImage">
    //       <Image src={imageColorizationThree} onClick={() => { setRestoredPhoto(imageColorizationThree) ,  console.log("starting load")}} alt='Restored Image 4' unoptimized  style={{ width: '100%', height: '100%', cursor: 'pointer' }}  width={100} height={100}/>
    //     </div>
    //     <div className="coloredImage">
    //       <Image src={imageColorizationFour}   onClick={() => { setRestoredPhoto(imageColorizationFour),  console.log("starting load") }} alt='Restored Image 4' unoptimized   style={{ width: '100%', height: '100%', cursor: 'pointer' }}  width={100} height={100}/>

    //     </div>

    //   </div>
    // </Container>
    <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }} >


      <Grid item xs={4} md={3} lg={1.5} >
        <div className="coloredImage">
          <Image src={restoreImageURLForVarient} onClick={() => { setRestoredPhoto(restoreImageURLForVarient), console.log("starting load") }} alt='Restored Image 1' unoptimized style={{ width: '100%', height: '100%', cursor: 'pointer' }} width={100} height={100} />
        </div>

      </Grid>

      <Grid item xs={4} md={3} lg={1.5} >
        <div className="coloredImage">
          <Image src={imageColorization} onClick={() => { setRestoredPhoto(imageColorization), console.log("starting load") }} alt='Restored Image 1' unoptimized style={{ width: '100%', height: '100%', cursor: 'pointer' }} width={100} height={100} />
        </div>
      </Grid>

      <Grid item xs={4} md={3} lg={1.5} >
        <div className="coloredImage">
          <Image src={imageColorizationOne} onClick={() => { setRestoredPhoto(imageColorizationOne), console.log("starting load") }} alt='Restored Image 2' unoptimized style={{ width: '100%', height: '100%', cursor: 'pointer' }} width={100} height={100} />
        </div>

      </Grid>

      <Grid item xs={4} md={3} lg={1.5} >
        <div className="coloredImage">
          <Image src={imageColorizationTwo} onClick={() => { setRestoredPhoto(imageColorizationTwo), console.log("starting load") }} alt='Restored Image 3' unoptimized style={{ width: '100%', height: '100%', cursor: 'pointer' }} width={100} height={100} />
        </div>

      </Grid>

      <Grid item xs={4} md={3} lg={1.5} >
        <div className="coloredImage">
          <Image src={imageColorizationThree} onClick={() => { setRestoredPhoto(imageColorizationThree), console.log("starting load") }} alt='Restored Image 4' unoptimized style={{ width: '100%', height: '100%', cursor: 'pointer' }} width={100} height={100} />
        </div>

      </Grid>

      <Grid item xs={4} md={3} lg={1.5} >
        <div className="coloredImage">
          <Image src={imageColorizationFour} onClick={() => { setRestoredPhoto(imageColorizationFour), console.log("starting load") }} alt='Restored Image 4' unoptimized style={{ width: '100%', height: '100%', cursor: 'pointer' }} width={100} height={100} />
        </div>

      </Grid>





    </Grid >
  )
}

export default ImageStrip