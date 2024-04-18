import { SessionProvider } from "next-auth/react"
import '@/styles/globals.css'
import NavBar from '@/components/NavBar'
import '@/styles/globals.css'
import { useEffect, useState } from 'react';
import AppContext from '@/components/AppContext';
import Footer from '@/components/Footer';
import Script from "next/script";


export default function App({
  Component,
  pageProps: { session, ...pageProps },

}) {
  const [fileUrl, setFileUrl] = useState('');
  const [path, setPath] = useState('')
  const [open, setOpen] = useState(false);
  const [removeImageFromTransformerJs, setRemoveImageFromTransformerJs] = useState('');
  // <script script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script >
  // <script src='../../utils/transformer.js'>
  // </script>
  return (
    <>
      <SessionProvider session={session}>
        <AppContext.Provider value={{ fileUrl, setFileUrl, path, setPath, removeImageFromTransformerJs, setRemoveImageFromTransformerJs }}>
          <NavBar open={open} setOpen={setOpen} />
          <Component {...pageProps} />
          <Footer />
        </AppContext.Provider>
      </SessionProvider >

    </>
  )
}