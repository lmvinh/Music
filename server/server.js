const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const lyricsFinder = require("lyrics-finder");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

// CORS configuration - Replace with your deployed frontend URL
const allowedOrigins = ["http://localhost:3000", "https://music-6bh7.vercel.app/"];
app.use(cors({
  origin: allowedOrigins
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  const spotifyApi = new SpotifyWebApi({
    redirectUri:"http://localhost:3000",
    clientId: "ef21180efe0a4fc8978edb0e875d9af2",
    clientSecret: "3c9bf8fdf16f416196371beaa480a407",
    refreshToken,
  });

  spotifyApi
    .refreshAccessToken()
    .then(data => {
      res.json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch(err => {
      console.error("Error refreshing access token:", err);
      res.sendStatus(400);
    });
});

app.post("/login", (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:3000",
    clientId: "ef21180efe0a4fc8978edb0e875d9af2",
    clientSecret: "3c9bf8fdf16f416196371beaa480a407",
  });

  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch(err => {
      console.error("Error during authorization code grant:", err);
      res.sendStatus(400);
    });
});

app.get("/lyrics", async (req, res) => {
  const lyrics = (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found";
  res.json({ lyrics });
});

// Start the server on the environment's PORT or 3001
const PORT =  3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
