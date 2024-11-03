import { useState, useEffect } from "react"
import useAuth from "./useAuth"
import TrackSearchResult from "./TrackSearchResult"
import { Container, Form, Button, Alert } from "react-bootstrap"
import SpotifyWebApi from "spotify-web-api-node"
import axios from "axios"

const spotifyApi = new SpotifyWebApi({
  clientId: "c2c9b1955aed4fb8897acbddba1a9653",
})

export default function Dashboard({ code }) {
  const accessToken = useAuth(code)
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [playingTrack, setPlayingTrack] = useState()
  const [lyrics, setLyrics] = useState("")
  const [isPremium, setIsPremium] = useState(false)

  function chooseTrack(track) {
    setPlayingTrack(track)
    setSearch("")
    setLyrics("")
  }

  useEffect(() => {
    if (!accessToken) return
    spotifyApi.setAccessToken(accessToken)

    // Check if user is Premium
    spotifyApi.getMe().then(user => {
      setIsPremium(user.body.product === "premium")
    }).catch(err => console.error("Error checking premium status:", err))
  }, [accessToken])

  useEffect(() => {
    if (!playingTrack) return

    axios
      .get("https://music-ten-rust.vercel.app/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then(res => {
        setLyrics(res.data.lyrics)
      })
  }, [playingTrack])

  // Search for tracks or fetch playlist by ID
  useEffect(() => {
    if (!accessToken) return

    // If search is empty, clear results
    if (!search) return setSearchResults([])

    // Check if search is a playlist ID
    if (search.match(/^[a-zA-Z0-9]{22}$/)) {
      // Assume search is a playlist ID
      spotifyApi.getPlaylist(search).then(res => {
        setSearchResults(
          res.body.tracks.items.map(item => {
            const track = item.track
            const smallestAlbumImage = track.album.images.reduce(
              (smallest, image) => {
                if (image.height < smallest.height) return image
                return smallest
              },
              track.album.images[0]
            )

            return {
              artist: track.artists[0].name,
              title: track.name,
              uri: track.uri,
              albumUrl: smallestAlbumImage.url,
            }
          })
        )
      }).catch(err => {
        console.error("Failed to fetch playlist:", err)
      })
    } else {
      // Perform regular track search
      let cancel = false
      spotifyApi.searchTracks(search).then(res => {
        if (cancel) return
        setSearchResults(
          res.body.tracks.items.map(track => {
            const smallestAlbumImage = track.album.images.reduce(
              (smallest, image) => {
                if (image.height < smallest.height) return image
                return smallest
              },
              track.album.images[0]
            )

            return {
              artist: track.artists[0].name,
              title: track.name,
              uri: track.uri,
              albumUrl: smallestAlbumImage.url,
            }
          })
        )
      })

      return () => (cancel = true)
    }
  }, [search, accessToken])

  return (
    <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
      <Form.Control
        type="search"
        placeholder="Search Songs, Artists, or Playlist ID"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <Button variant="primary" onClick={() => setSearchResults([])}>Clear Search</Button>
      <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchResults.map(track => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={() => chooseTrack(track)}
          />
        ))}
        {searchResults.length === 0 && (
          <div className="text-center" style={{ whiteSpace: "pre" }}>
            {lyrics}
          </div>
        )}
      </div>

      {!isPremium && (
        <Alert variant="warning" className="text-center">
          Spotify playback is restricted to Premium users. Use the Spotify app to play tracks.
        </Alert>
      )}

      {playingTrack && (
        <Button
          variant="success"
          href={`https://open.spotify.com/track/${playingTrack.uri.split(":")[2]}`}
          target="_blank"
          className="mt-3"
        >
          Open "{playingTrack.title}" in Spotify
        </Button>
      )}
    </Container>
  )
}
