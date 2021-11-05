// Import node packages
const express = require("express");
const app = express();
const sassMiddleware = require("node-sass-middleware");
const SpotifyWebApi = require("spotify-web-api-node");
// Set the port to listen on 8888 or whatever is in the environment variable PORT
const PORT = process.env.PORT || 8888;

// Client details from Spotify Dashboard
const client_id = "YOUR_CLIENT_ID";
const client_secret = "YOUR_CLIENT_SECRECT";
const redirect_url = "YOUR_CALLBACK_URL";
// Quiz playlist ID, link to playlist: https://open.spotify.com/playlist/65CuEpxGE1EHYGGyS3XyVR?si=a77d581f4fa94a12
// Another playlist: https://open.spotify.com/playlist/0hZ9THXyLWxcjp3ZmEHesU?si=8beda6a8196e47c2
// Lugna favoriter: https://open.spotify.com/playlist/1VmuSeXFwxVX3JmGwFZ2I9?si=e44f40f99f5a4ebd
// 720p : https://open.spotify.com/playlist/0DB9fMOskowjeJGLyRZ7st?si=8b6b1cd662214e89
// Probablu going to do this so the user can input a playlist also, so its not hard coded
const birksPappasquizPlaylistID = "65CuEpxGE1EHYGGyS3XyVR";
const anotherMusicQuizPlaylist = "0hZ9THXyLWxcjp3ZmEHesU";
const lugnaFavoriterPlaylist = "1VmuSeXFwxVX3JmGwFZ2I9";
const birksPlaylist = "0DB9fMOskowjeJGLyRZ7st";
// Index in playlist
let indexInPlaylist = 0;
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
  var result = await getSongFromPlaylist();
  res.json(result);
});
// Get the artist and song from the frontend
app.get("/fetchFromSpotify_alternatives", async (req, res) => {
  var result = await getSongsFromSearch(req.query.artist, req.query.song); // Get the artist and song from the frontend which will determine the alternatives
  console.log(req.query.artist);
  console.log(req.query.song);
  res.json(result);
});

// Get the 'right answer' from the playlist using the Spotify Web API node package
async function getSongFromPlaylist() {
  // Get a playlist from the playlist ID
  // Create two variables, is there a cleaner way?
  let answerArray = [];
  let filteredPlaylist = [];
  try {
    await spotifyApi.getPlaylist(birksPappasquizPlaylistID).then((data) => {
      // Filter out the songs that dont have a preview url
      data.body.tracks.items.forEach((element) => {
        if (element.track.preview_url !== null) {
          filteredPlaylist.push(element.track);
        }
      });
      // Get the song, artist, preview url and image url from the filtered playlist
      console.log({ indexInPlaylist });
      // Push the song, artist, preview url and image url to the answerArray. This is the right answer. There most certainly is a better way to do this, beccause now im fetching the songs over and over again
      answerArray.push({
        song: filteredPlaylist[indexInPlaylist].name,
        artist: filteredPlaylist[indexInPlaylist].artists[0].name,
        image: filteredPlaylist[indexInPlaylist].album.images[1].url,
        previewUrl: filteredPlaylist[indexInPlaylist].preview_url,
      });
      // Increment the index in the playlist
      indexInPlaylist++;
      console.log({ answerArray });
    });
  } catch (error) {
    console.error({ error });
  }
  // return the answerArray
  return answerArray;
}
// Get the alternative songs using the artist from the frontend
async function getSongsFromSearch(artist, song) {
  let alternativesArray = [];
  try {
    await spotifyApi
      // Search for tracks by the artist depending on what song is playing
      .searchTracks(artist, { offset: 5 })
      .then((data) => {
        // Filter out the songs that have the same name or the word Live, Remix, Remaster, Original or Originally. There must be a better way to do this
        data.body.tracks.items.every((element) => {
          if (
            !element.name.includes(song) &&
            !element.name.includes("Live") &&
            !element.name.includes("Remix") &&
            !element.name.includes("Remaster") &&
            !element.name.includes("Original") &&
            !element.name.includes("Originally")
          ) {
            // Push the alternatives in an array
            alternativesArray.push({
              song: element.name,
              image: element.album.images[1].url,
              artist: element.artists[0].name,
            });
          }
          // If the array contains of 5 alternatives, break the loop
          if (alternativesArray.length === 5) return false;
          return true;
        });
        // Shuffle it, why not?
        shuffleArray(alternativesArray);
        console.log({ alternativesArray });
      });
  } catch (error) {
    console.error({ error });
  }
  return alternativesArray;
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
  redirectUri: redirect_url,
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
