import { SessionProvider } from "next-auth/react"
import '@/styles/globals.css'
import NavBar from '@/components/NavBar'
import '@/styles/globals.css'
import { useState } from 'react';
import AppContext from '@/components/AppContext';
import Footer from '@/components/Footer';
import { Analytics } from "@vercel/analytics/react"


export default function App({
  Component,
  pageProps: { session, ...pageProps },

}) {
  const [fileUrl, setFileUrl] = useState('');
  const [path, setPath] = useState('')
  const [open, setOpen] = useState(false);
  <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
  return (
    <SessionProvider session={session}>
      <Analytics />
      <AppContext.Provider value={{ fileUrl, setFileUrl, path, setPath }}>
        <NavBar open={open} setOpen={setOpen} />
        <Component {...pageProps} />
        <Footer />
      </AppContext.Provider>
    </SessionProvider>
  )
}