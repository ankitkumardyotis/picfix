import Head from 'next/head'
import LandingPage from '@/components/landingPage/LandingPage'

export default function Home({ open, setOpen }) {

  return (
    <>
      <Head>
        <title>PicFix.AI | AI-Powered Photo Restoration | Background Removal </title>
        <meta name="description" content="PicFix is an AI-based online tool that restores photo quality, removes backgrounds, and eliminates motion blur from images. Try our advanced image editing services for stunning results." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="photo restorations, pic fix, photo editing, photo retouching, photo cleaning, photo fix, remove background, remove motion blur from image"/>
        <link rel="icon" href="/assets/logo.png" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}',{
          page_path: window.location.pathname,

        });
      `,
          }}
        />
      </Head>
      <main >
        <LandingPage open={open} setOpen={setOpen} />

      </main>
    </>
  )
}
