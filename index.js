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
// Quiz playlist ID, link to playlist: https://open.spotify.com/playlist/65CuEpxGE1EHYGGyS3XyVR?si=a77d581f4fa94a12
// Another playlist: https://open.spotify.com/playlist/0hZ9THXyLWxcjp3ZmEHesU?si=8beda6a8196e47c2
// Lugna favoriter: https://open.spotify.com/playlist/1VmuSeXFwxVX3JmGwFZ2I9?si=e44f40f99f5a4ebd -- Not working???
// 720p : https://open.spotify.com/playlist/0DB9fMOskowjeJGLyRZ7st?si=8b6b1cd662214e89
// All out 80s: https://open.spotify.com/playlist/37i9dQZF1DX4UtSsGT1Sbe?si=9dba249da0804dda
// Some hip hop: https://open.spotify.com/playlist/3WznMJPiYBt79GaKVQbrOY?si=395210c221de439c
// Just a shit tone of music : https://open.spotify.com/playlist/4U1GUcN3BuiB4IbvpJ4qXH?si=8069712808724810
// Top 50 global : https://open.spotify.com/playlist/37i9dQZEVXbNG2KDcFcKOF?si=aefa22b8c6444db9
// Songs i'm having trouble with : https://open.spotify.com/playlist/3ruyDRPnNMOW80mZPVsKRu?si=b6a03668e5ea4c99
// Probablu going to do this so the user can input a playlist also, so its not hard coded
const birksPappasquizPlaylistID = "65CuEpxGE1EHYGGyS3XyVR";
const anotherMusicQuizPlaylist = "0hZ9THXyLWxcjp3ZmEHesU";
const lugnaFavoriterPlaylist = "1VmuSeXFwxVX3JmGwFZ2I9";
const birksPlaylist = "0DB9fMOskowjeJGLyRZ7st";
const allOut80s = "37i9dQZF1DX4UtSsGT1Sbe";
const hiphop = "3WznMJPiYBt79GaKVQbrOY";
const bangersByMehler = "4U1GUcN3BuiB4IbvpJ4qXH";
const top50global = "37i9dQZEVXbNG2KDcFcKOF";
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
  console.log(req.query.artist);
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
  console.log({ artist });
  artist = replaceInString(" and", " &", artist);
  console.log({ artist });
  let alternativesArray = [];
  let filteredPlaylist = [];
  // console.log({ song });
  let modifiedSong = removeCharactersAfterCharacterInString(song, " -");

  try {
    await spotifyApi.searchTracks(artist, { limit: 50, offset: 0 }).then((data) => {
      data.body.tracks.items.forEach((element) => {
        if (
          !element.name.includes(modifiedSong || song) &&
          element.artists[0].name == artist &&
          filteredPlaylist.some((e) => e.song === element.name) === false
        ) {
          filteredPlaylist.push(element);
        }
      });
    });
  } catch (error) {
    console.error({ error });
  }

  shuffleArray(filteredPlaylist);
  for (let i = 0; i < 3; i++) alternativesArray.push(filteredPlaylist[i]);
  console.log({ alternativesArray });
  return alternativesArray;
}

async function ifSongsFromSearchByArtistDidNotReturnEnough(artist) {
  let artistsTop10Tracks = [];
  try {
    await spotifyApi.getArtistTopTracks(artist, "SE").then((data) => {
      data.body.tracks.forEach((element) => {
        artistsTop10Tracks.push({
          song: element.name,
          image: element.album.images[1].url,
          artist: element.artists[0].name,
        });
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
