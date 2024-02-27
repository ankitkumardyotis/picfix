import { SessionProvider } from "next-auth/react"
import '@/styles/globals.css'
import NavBar from '@/components/NavBar'
import '@/styles/globals.css'
import { useState } from 'react';
import AppContext from '@/components/AppContext';
import Footer from '@/components/Footer';


export default function App({
  Component,
  pageProps: { session, ...pageProps },

}) {
  const [fileUrl, setFileUrl] = useState('');
  const [open, setOpen] = useState(false);
  <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
  return (
    <SessionProvider session={session}>
      <AppContext.Provider value={{ fileUrl, setFileUrl }}>
        <NavBar open={open} setOpen={setOpen} />
        <Component {...pageProps} />
        <Footer />
      </AppContext.Provider>
    </SessionProvider >
  )
}