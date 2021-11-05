// Import node packages
const express = require("express");
const app = express();
const axios = require("axios");
const sassMiddleware = require("node-sass-middleware");
const SpotifyWebApi = require("spotify-web-api-node");
// Set the port to listen on 8888 or whatever is in the environment variable PORT
const PORT = process.env.PORT || 8888;

// Client details from Spotify Dashboard
const client_id = "";
const client_secret = "";
const redirect_uri = "http://localhost:8888/callback";
// Quiz playlist ID, link to playlist: https://open.spotify.com/playlist/65CuEpxGE1EHYGGyS3XyVR?si=a77d581f4fa94a12
// Another playlist: https://open.spotify.com/playlist/0hZ9THXyLWxcjp3ZmEHesU?si=8beda6a8196e47c2
const birksPappasquizPlaylistID = "65CuEpxGE1EHYGGyS3XyVR";
const anotherMusicQuizPlaylist = "0hZ9THXyLWxcjp3ZmEHesU";
// Index in playlist, want this to be dynamic and connected to the frontend
let searchIndex = createRandomNumberBetween(0, 100);
function createRandomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
let artistQuery = "";
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
app.get("/fetchFromSpotify_alternatives", async (req, res) => {
  var result = await getSongsFromSearch();
  res.json(result);
});
app.get("/fetchFromSpotify_answer", async (req, res) => {
  var result = await getSongFromPlaylist();
  res.json(result);
});

// Get the 'right answer' from the playlist using the Spotify Web API node package
async function getSongFromPlaylist() {
  // Get a playlist
  // Placeholder for now, if we dont return anything we get a banger instead
  let resArray = [];
  try {
    await spotifyApi.getPlaylist(anotherMusicQuizPlaylist).then((data) => {
      // Get the song, artist, preview url and image url from the playlist
      resArray.push({
        song: formatDataFromPlaylist(data).name,
        artist: formatDataFromPlaylist(data).artists[0].name,
        image: formatDataFromPlaylist(data).album.images[1].url,
        previewUrl: formatDataFromPlaylist(data).preview_url,
      });
      artistQuery = formatDataFromPlaylist(data).artists[0].name;
      console.log({ resArray });
    });
  } catch (error) {
    console.error({ error });
  }
  searchIndex = createRandomNumberBetween(0, 100);
  return resArray;
}
// Get the alternative songs using the artist from the
async function getSongsFromSearch() {
  let resArray = [];
  try {
    await spotifyApi
      // Try and play around with the search query, you can have artist:, album:, track:, playlist:, and show:
      .searchTracks(`artist:${artistQuery}`, { limit: 3, offset: 0 })
      .then((data) => {
        data.body.tracks.items.forEach((element) => {
          resArray.push({
            song: element.name,
            image: element.album.images[1].url,
          });
        });
        console.log({ resArray });
      });
  } catch (error) {
    console.error({ error });
  }
  return resArray;
}

// Format the data from the playlist to make it a little easier to read and work with but I also have an error where sometimes it says that the track is undefined which is guess is because the data thats passed in is undefined
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
