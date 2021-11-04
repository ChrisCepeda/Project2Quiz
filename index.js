// Import node packages
const express = require("express");
const app = express();
const axios = require("axios");
const sassMiddleware = require("node-sass-middleware");
const SpotifyWebApi = require("spotify-web-api-node");
// Set the port to listen on 8888 or whatever is in the environment variable PORT
const PORT = process.env.PORT || 8888;

// Client details from Spotify Dashboard
const client_id = "YOUR_CLIENT_ID";
const client_secret = "YOUR_CLIENT_SECRET";
const redirect_uri = "http://localhost:8888/callback";
// Url to Spotify API
const spotifyUrl = "https://api.spotify.com/v1/";
// Quiz playlist ID, link to playlist: https://open.spotify.com/playlist/65CuEpxGE1EHYGGyS3XyVR?si=a77d581f4fa94a12
const quizPlaylistID = "65CuEpxGE1EHYGGyS3XyVR";
// Index in playlist, want this to be dynamic and connected to the frontend
// Here on index 13 you will encounter a bug, I get three of the same songs. Some indexes will not return anything when I search for alternatives to the song. Try index 28 and you will see the preview url is null, even if its a song by a famous artist.
let searchIndex = 13;

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

// Fetches data from Spotify API
var fetchFromSpotify = async (artist, track, url, limit, offset, market) => {
  // Refresh the access token and get the new one
  let access_token = await refreshToken();
  // Check if track parameter is empty, if so remove it from the url
  let hasTrack = "";
  track == "" ? (hasTrack = "") : (hasTrack = "+track:");
  console.log({ artist, track, url, limit, offset, market });
  try {
    let res = await axios(
      `${url}search?q=artist:${artist}${hasTrack}${track}&type=track&limit=${limit}&offset=${offset}&market=${market}`,
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};

// Searches for three tracks by artist and offset them by 5 to hopefully not get a remastered version
var searchForAlternativeTracksByArtist = async () => {
  try {
    let playList = await getSongsFromPlaylist();
    let res = await fetchFromSpotify(playList.artist, "", spotifyUrl, 3, 5, "SE");
    return res.data.tracks.items;
  } catch (error) {
    console.error({ error });
  }
};

// Searches for a single track by artist and songname to hopfullly get the acutal song from the playlist
var searchForSingleTrackByArtistAndSongname = async () => {
  try {
    let playList = await getSongsFromPlaylist();
    console.log({ playList });
    let res = await fetchFromSpotify(playList.artist, playList.songName, spotifyUrl, 1, 0, "SE");
    return res.data.tracks.items[0];
  } catch (error) {
    console.error({ error });
  }
};

// Set the index.html file to be the homepage
app.get("/", (req, res) => {
  res.sendFile("./public/index.html", { root: __dirname });
});

// Create a url endpoint? to later fetch in the frontend
app.get("/fetchFromSpotify_alternatives", async (req, res) => {
  var result = await searchForAlternativeTracksByArtist();
  res.json(result);
});
app.get("/fetchFromSpotify_answer", async (req, res) => {
  var result = await searchForSingleTrackByArtistAndSongname();
  res.json(result);
});
app.get("/previewUrl", async (req, res) => {
  var result = await getPreviewUrl();
  res.json(result);
});

// Get the songs from the playlist using the Spotify Web API node package
async function getSongsFromPlaylist() {
  // Get a playlist
  // Placeholder for now, if we dont return anything we get a banger instead
  let songName = "Only You";
  let artist = "Zara Larsson";
  try {
    await spotifyApi.getPlaylist(quizPlaylistID).then(function getSongFromPlaylist(data) {
      // Get the song name and artist from the playlist
      songName = formatDataFromPlaylist(data).name;
      artist = formatDataFromPlaylist(data).artists[0].name;
    });
  } catch (error) {
    console.error({ error });
  }

  return {
    songName: songName,
    artist: artist,
  };
}
// Get the preview url for the song, high chance it will be null
async function getPreviewUrl() {
  let previewUrl = "";
  await spotifyApi.getPlaylist(quizPlaylistID).then(
    function getPreviewUrl(data) {
      previewUrl = formatDataFromPlaylist(data).preview_url;
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
  return previewUrl;
}
// Format the data from the playlist to make it a little easier to read and work with
function formatDataFromPlaylist(data) {
  let formated = data.body.tracks.items[searchIndex].track;
  return formated;
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
  clientId: client_id,
  clientSecret: client_secret,
});

// Send the user to the Spotify login page and ask them to authorize to get the access token
app.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// When the user is redirected back from the Spotify login page, get the access token
app.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  // const state = req.query.state;

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
      res.sendFile("./public/quizPage.html", { root: __dirname });
    })
    .catch((error) => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

// Start the server on port 8888 or whatever port is set in the environment
app.listen(PORT, () =>
  console.log(`HTTP Server up. Now go to http://localhost:${PORT}/login in your browser.`)
);

// Function to refresh the access token
async function refreshToken() {
  const data = await spotifyApi.refreshAccessToken();
  const access_token = data.body["access_token"];
  spotifyApi.setAccessToken(access_token);
  return access_token;
}
