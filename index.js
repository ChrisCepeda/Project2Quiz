// Import node packages
const express = require("express");
const app = express();
const sassMiddleware = require("node-sass-middleware");
const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();
// Set the port to listen on 8888 or whatever is in the environment variable PORT
const PORT = process.env.PORT || 8888;

// Client details from Spotify Dashboard
const redirect_uri = "http://localhost:8888/callback";
const songsImHavingTroubleWith = "3ruyDRPnNMOW80mZPVsKRu";

// Tell express to use the sass middleware
app.use(
  "/styles",
  sassMiddleware({
    src: __dirname + "/public/styles/",
    dest: __dirname + "/public/styles/",
    debug: true,
    outputStyle: "expanded",
  })
);
// Set the public folder to serve static assets
app.use(express.static("./public"));

// Set the index.html file to be the homepage
app.get("/", (req, res) => {
  res.sendFile("./public/index.html", { root: __dirname });
});

// Create a url endpoint? to later fetch in the frontend
app.get("/fetchFromSpotify_answer", async (req, res) => {
  var result = await getSongFromPlaylist(req.query.playlist);
  res.json(result);
});
// Get the artist and song from the frontend
app.get("/fetchFromSpotify_alternatives", async (req, res) => {
  var result = await getSongsFromSearch(req.query.artist, req.query.song, req.query.id);
  res.json(result);
});

async function getSongFromPlaylist(choosenPlaylist) {
  let playlist = [];
  try {
    await spotifyApi
      .getPlaylistTracks(choosenPlaylist, { limit: 100, offset: 0, fields: "items" })
      .then((data) => {
        data.body.items.forEach((element) => {
          if (element.track.preview_url === null) return;
          playlist.push(element.track);
        });
      });
  } catch (error) {
    console.error({ error });
  }
  return playlist;
}

async function getSongsFromSearch(artist, song, id) {
  artist = replaceInString(" and", " &", artist);
  let alternativesArray = [];
  let filteredPlaylist = [];
  let modifiedSong = removeCharactersAfterCharacterInString(song, " -");

  try {
    await spotifyApi.searchTracks(artist, { limit: 50, offset: 0 }).then((data) => {
      data.body.tracks.items.forEach((element) => {
        if (
          !element.name.toLowerCase().includes(modifiedSong.toLowerCase() || song.toLowerCase()) &&
          element.artists[0].name == artist &&
          !element.name.includes("Live") &&
          filteredPlaylist.some((e) => e.name === element.name) === false
        ) {
          filteredPlaylist.push(element);
        }
      });
    });
  } catch (error) {
    console.error({ error });
  }
  if (filteredPlaylist.length < 3) {
    moreSongs = await ifSongsFromSearchByArtistDidNotReturnEnough(id);
    moreSongs.forEach((element) => {
      if (
        filteredPlaylist.some((e) => e.name === element.name) === false &&
        !element.name.toLowerCase().includes(modifiedSong.toLowerCase() || song.toLowerCase())
      ) {
        filteredPlaylist.push(element);
      }
    });
  }
  shuffleArray(filteredPlaylist);
  for (let i = 0; i < 3; i++) alternativesArray.push(filteredPlaylist[i]);
  return alternativesArray;
}

async function ifSongsFromSearchByArtistDidNotReturnEnough(artist) {
  let artistsTop10Tracks = [];
  try {
    await spotifyApi.getArtistTopTracks(artist, "SE").then((data) => {
      data.body.tracks.forEach((element) => {
        artistsTop10Tracks.push(element);
      });
    });
  } catch (error) {
    console.error({ error });
  }
  return artistsTop10Tracks;
}

function replaceInString(replace, character, toReplace) {
  return toReplace.replace(replace, character);
}
// Function to modify string
function removeCharactersAfterCharacterInString(input, modification) {
  let index = input.lastIndexOf(modification);
  if (index >= 0) input = input.substring(0, index); // or index + 1 to keep slash
  return input;
}
// Shuffle the array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Set the scopes that we need to access the Spotify API, basically all of them
const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
];
// Initialize a new SpotifyApi, and pass in the client_id and client_secret
const spotifyApi = new SpotifyWebApi({
  redirectUri: redirect_uri,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Send the user to the Spotify login page and ask them to authorize to get the access token
app.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// When the user is redirected back from the Spotify login page, get the access token
app.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      // Set the access token and refresh token
      const access_token = data.body["access_token"];
      const refresh_token = data.body["refresh_token"];
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      // Send the user to the quiz page (Probably a better way to do this)
      res.sendFile("./public/chooseTheme.html", { root: __dirname });
    })
    .catch(() => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

// Start the server on port 8888 or whatever port is set in the environment
app.listen(PORT, () => console.log(`HTTP Server up and running on http://localhost:${PORT}`));

// Function to refresh the access token if needed.
async function refreshToken() {
  const data = await spotifyApi.refreshAccessToken();
  const access_token = data.body["access_token"];
  spotifyApi.setAccessToken(access_token);
  return access_token;
}
