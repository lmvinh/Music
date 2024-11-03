
import React from "react"
const AUTH_URL =
  "https://accounts.spotify.com/authorize?client_id=ef21180efe0a4fc8978edb0e875d9af2&response_type=code&redirect_uri=http://music-6bh7.vercel.app&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state"

export default function Login() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <a className="btn btn-success btn-lg" href={AUTH_URL}>
        Login With Spotify
      </a>
    </div>
  )
}
