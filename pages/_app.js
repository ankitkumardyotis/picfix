import NavBar from '@/components/NavBar'
import '@/styles/globals.css'
import { useState } from 'react';
import AppContext from '@/components/AppContext';
import Head from 'next/head';


export default function App({ Component, pageProps: { ...pageProps } }) {

  const [fileUrl, setFileUrl] = useState('');
  const [open, setOpen] = useState(false);
  return <>
    <AppContext.Provider value={{ fileUrl, setFileUrl }}>
      <NavBar open={open} setOpen={setOpen} />
      <Component {...pageProps} />
    </AppContext.Provider>
  </>
}
