import { SessionProvider } from "next-auth/react"
import '@/styles/globals.css'
import NavBar from '@/components/NavBar'
import '@/styles/globals.css'
import { useEffect, useMemo, useState } from 'react';
import AppContext from '@/components/AppContext';
import Footer from '@/components/Footer';
import Script from "next/script";
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from "notistack";

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


  const theme = createTheme({
    // palette: {
    //   primary: {
    //     main: '#6200ea',
    //   },
    //   secondary: {
    //     main: '#03a9f4',
    //   },
    // },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h1: {
        fontWeight: 600,
        marginBottom: '1rem',
        fontSize: '2.25rem',
      },
      h2: {
        fontWeight: 500,
        fontSize: '1.5rem',
      },
      body1: {
        fontSize: '1rem',
        // color: '#6b7280',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            padding: '1.5rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '0.5rem',
          },
        },
      },
    },
  });
  return (
    <>
      <SessionProvider session={session}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          autoHideDuration={3000}
        >
          <ThemeProvider theme={theme}>
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
          </ThemeProvider>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </SnackbarProvider>
      </SessionProvider >

    </>
  )
}