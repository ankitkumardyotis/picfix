import Head from 'next/head'
import LandingPage from '@/components/LandingPage';
import Script from 'next/script'
export default function Home({ open, setOpen }) {
  return (
    <>

      <Head>
        <title>PicFix.AI | AI-Powered Photo Restoration </title>
        <meta name="description" content="PicFix is an AI-based online tool that restores photo quality, removes backgrounds, eliminates blur, Trendy Look for fashionable clothing generation and AI powered Home Makeover. Try our advanced image editing services for stunning results." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="photo restorations, pic fix, photo editing, photo retouching, photo cleaning, photo fix, remove background,AI-based online tool, Restore photo quality, Remove backgrounds, Eliminate blur, Trendy Look, Fashionable clothing generation, AI-powered Home Makeover, Advanced image editing services, Stunning results, Image restoration, Background removal, Blur removal, Fashion generation, Home transformation, AI image editing" />
        <link rel="icon" href="/assets/logo.png" />
      
      </Head>
      <Script strategy="lazyOnload" async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`} />

      <Script
        id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}
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

      <main   >
        <LandingPage open={open} setOpen={setOpen} />
        {/* <Footer /> */}
      </main>


    </>
  )
}
