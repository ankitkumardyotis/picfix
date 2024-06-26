import { SessionProvider } from "next-auth/react"
import '@/styles/globals.css'
import NavBar from '@/components/NavBar'
import '@/styles/globals.css'
import { useEffect, useMemo, useState } from 'react';
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
  const [timerForRunModel, setTimerForRunModel] = useState(0)
  const [creditPoints, setCreditPoints] = useState(0)
  return (
    <>
      <SessionProvider session={session}>
        <AppContext.Provider value={{ fileUrl, setFileUrl, path, setPath, removeImageFromTransformerJs, timerForRunModel, setTimerForRunModel, setRemoveImageFromTransformerJs, creditPoints, setCreditPoints }}>
          <NavBar open={open} setOpen={setOpen} creditPoints={creditPoints} setCreditPoints={setCreditPoints} />
          {useMemo(() => <Component {...pageProps} />, [fileUrl,
            path,
            open,
            removeImageFromTransformerJs,
            pageProps,
            timerForRunModel])}
          <Footer />
        </AppContext.Provider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </SessionProvider >

    </>
  )
}