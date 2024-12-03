import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from 'next/head'
import LandingPage from '@/components/LandingPage';
import Script from 'next/script';

export default function Home({ open, setOpen }) {
  const { data: session } = useSession()
  const router = useRouter();

  
  return (
    <>

      <Head>
        <title>PicFix.AI | AI-Powered Photo Restoration </title>
        <meta name="description" content="PicFix is an AI-based online tool that restores photo quality, removes backgrounds, eliminates blur, Trendy Look for fashionable clothing generation and AI powered Home Makeover. Try our advanced image editing services for stunning results." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="photo restorations, pic fix, photo editing, photo retouching, photo cleaning, photo fix, remove background,AI-based online tool, Restore photo quality, Remove backgrounds, Eliminate blur, Trendy Look, Fashionable clothing generation, AI-powered Home Makeover, Advanced image editing services, Stunning results, Image restoration, Background removal, Blur removal, Fashion generation, Home transformation, AI image editing" />
        <link rel="logo" href="/favicon.ico" sizes="32x32" />

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
  );
}







// <>
// {/* <CreditPlanCard/> */}
// <div className="outerContent" style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
//   <div className="innerContent" style={{ width: '50vw', position: 'relative', height: '50vh', backgroundColor: 'rgba(0,128,128,.1)', borderRadius: '20px', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//     {session && <div style={{ float: 'right', cursor: 'pointer', backgroundColor: 'teal', padding: '5px', color: '#ececec', borderRadius: '10px', top: 20, left: 0, position: 'absolute', transform: 'rotate(-33deg)' }} onClick={() => signOut()}>Sign Out  </div>}
//     <h1 style={{ color: 'black' }}>Prisma Auth setup</h1>
//     {/* Welcome user  */}
//     {session && <h3 style={{ color: 'black', marginTop: '10px', marginBottom: '30px' }}>Hi {session?.user?.name}, Welcome to Picfix.ai</h3>
//     }
//     <ul style={{ display: 'flex', flexDirection: 'row', justifyItems: 'center', alignItems: 'center', gap: '40px', marginTop: '20px', fontSize: '22px' }}>
//       <li style={{ listStyle: 'none', cursor: 'pointer' }} onClick={() =>
//         router.push('/')}>Home</li>
//       <li style={{ listStyle: 'none', cursor: 'pointer' }} onClick={() =>
//         router.push('/price')
//       }>Price</li>
//       <li style={{ listStyle: 'none', cursor: 'pointer' }} onClick={() =>
//         router.push('/login')
//       }>Sign In</li>
//     </ul>


//     {/* {
//       session && (
//         <>
//           <p>Signed in as {session.user.email}</p>
//           <img style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '20px' }} src={session.user.image} alt={session.user.name} />
//           <button style={{ width: '100px', height: '40px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => signOut()}>Sign out</button>
//         </>
//       )} */}

//     {/* {!session && <button style={{ width: '100px', height: '40px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => signIn()}>Sign in</button>} */}
//   </div>
// </div>
// </>
