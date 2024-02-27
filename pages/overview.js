import { useSession, signIn, signOut } from "next-auth/react"

export default function CamperVanPage() {
  const { data: session, status } = useSession()
  const userEmail = session?.user?.email

  if (status === "loading") {
    return <p style={{marginTop:'10rem'}}>Hang on there...</p>
  }

  if (status === "authenticated") {
    return (
      <div  style={{marginTop:'10rem'}}>
        <p>Signed in as {userEmail}</p>
        <button onClick={() => signOut()}>Sign out</button>
        <img src="https://cdn.pixabay.com/photo/2017/08/11/19/36/vw-2632486_1280.png" />
      </div>
    )
  }

  return (
    <>
      <p  style={{marginTop:'10rem'}}>Not signed in.</p>
      <button onClick={() => signIn("google")}>Sign in with google</button>
    </>
  )
}