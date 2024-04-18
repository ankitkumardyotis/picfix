import { SessionProvider } from "next-auth/react"
import '@/styles/globals.css'
import NavBar from '@/components/NavBar'
import '@/styles/globals.css'
import { useEffect, useState } from 'react';
import AppContext from '@/components/AppContext';
import Footer from '@/components/Footer';
<<<<<<< HEAD
import Script from "next/script";
=======
import { Analytics } from "@vercel/analytics/react"
>>>>>>> 2fac2e4fbf2718a7eb8a6eeaa6229ba2d028b132


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
<<<<<<< HEAD
    <>
      <SessionProvider session={session}>
        <AppContext.Provider value={{ fileUrl, setFileUrl, path, setPath, removeImageFromTransformerJs, setRemoveImageFromTransformerJs }}>
          <NavBar open={open} setOpen={setOpen} />
          <Component {...pageProps} />
          <Footer />
        </AppContext.Provider>
      </SessionProvider >

    </>
=======
    <SessionProvider session={session}>
      <Analytics />
      <AppContext.Provider value={{ fileUrl, setFileUrl, path, setPath }}>
        <NavBar open={open} setOpen={setOpen} />
        <Component {...pageProps} />
        <Footer />
      </AppContext.Provider>
    </SessionProvider>
>>>>>>> 2fac2e4fbf2718a7eb8a6eeaa6229ba2d028b132
  )
}