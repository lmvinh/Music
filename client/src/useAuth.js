import { useState, useEffect } from "react";
import axios from "axios";

export default function useAuth(code) {
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  useEffect(() => {
    // Exchange authorization code for tokens
    axios
      .post("https://music-ten-rust.vercel.app/login", { code })
      .then(res => {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setExpiresIn(res.data.expiresIn);
        window.history.pushState({}, null, "/"); // Clear code from URL
      })
      .catch((error) => {
        console.error("Login error:", error);
        window.location = "/"; // Redirect if login fails
      });
  }, [code]);

  useEffect(() => {
    // Only run if refreshToken and expiresIn are available
    if (!refreshToken || !expiresIn) return;

    const refreshInterval = setInterval(() => {
      axios
        .post("https://music-ten-rust.vercel.app/refresh", { refreshToken })
        .then(res => {
          setAccessToken(res.data.accessToken);
          setExpiresIn(res.data.expiresIn);
        })
        .catch((error) => {
          console.error("Token refresh error:", error);
          window.location = "/"; // Redirect if token refresh fails
        });
    }, (expiresIn - 60) * 1000); // Refresh 1 minute before expiry

    return () => clearInterval(refreshInterval); // Cleanup on unmount or change
  }, [refreshToken, expiresIn]);

  return accessToken;
}
