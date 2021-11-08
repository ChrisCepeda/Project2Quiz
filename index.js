// Import node packages
const express = require("express");
const app = express();
const sassMiddleware = require("node-sass-middleware");
const SpotifyWebApi = require("spotify-web-api-node");
// Set the port to listen on 8888 or whatever is in the environment variable PORT
const PORT = process.env.PORT || 8888;

// Client details from Spotify Dashboard
const client_id = "37b1eaecb89b4ec286c599334d926d83";
const client_secret = "23913c280cfe4bfb9c8aa8e8097a9491";
const redirect_url = "http://localhost:8888/callback";
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

// Index in playlist
let indexInPlaylist = 6;
// Offset in the playlist, needed if the playlist have more than 100 songs
let offset = 0;
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
  var result = await getSongsFromSearch(req.query.artist, req.query.song, req.query.id); // Get the artist and song from the frontend which will determine the alternatives
  res.json(result);
});

// Get the 'right answer' from the playlist using the Spotify Web API node package
async function getSongFromPlaylist() {
  // Get a playlist from the playlist ID
  // Create two variables, is there a cleaner way?
  let currentSongToBeDisplayed;
  try {
    await spotifyApi
      .getPlaylistTracks(top50global, { limit: 100, offset: offset, fields: "items" })
      .then((data) => {
        // Filter out the songs that dont have a preview url
        indexInPlaylist++;
        currentSongToBeDisplayed = filterSongsInPlaylist(data.body.items, indexInPlaylist);
        console.log({ currentSongToBeDisplayed });
        // return the answerArray
      });
  } catch (error) {
    console.error({ error });
  }
  return currentSongToBeDisplayed;
}

function filterSongsInPlaylist(playlist, i) {
  let filteredPlaylist = [];
  // Get the song, artist, preview url and image url from the filtered playlist
  // Push the song, artist, preview url and image url to the answerArray. This is the right answer. There most certainly is a better way to do this, beccause now im fetching the songs over and over again
  playlist.forEach((song) => {
    if (song.track.preview_url !== null) {
      filteredPlaylist.push(song.track);
    }
  });
  let trackName = filteredPlaylist[i].name;
  let artistName = filteredPlaylist[i].artists[0].name;
  let previewUrl = filteredPlaylist[i].preview_url;
  let imageUrl = filteredPlaylist[i].album.images[1].url;
  let id = filteredPlaylist[i].artists[0].id;
  let filteredSong = pushSongsWithPreviewToArray(trackName, artistName, imageUrl, previewUrl, id);
  // If the index is equal to the length of the filteredPlaylist, set the offset to 100 and reset the count
  if (i === filteredPlaylist.length - 1) {
    offset += 100;
    indexInPlaylist = 0;
  }
  return filteredSong;
}
function pushSongsWithPreviewToArray(song, artist, image, previewUrl, id) {
  let answerArray = [];
  answerArray.push({
    song: song,
    artist: artist,
    image: image,
    previewUrl: previewUrl,
    artistId: id,
  });
  return answerArray;
}
// Get the alternative songs using the artist from the frontend
async function getSongsFromSearch(artist, song, id) {
  // replace the and with &, can fuck with some artists/bands, im up for a better solution
  artist = artist.replace(" and", " &");
  let alternativesArray = [];
  let filteredPlaylist = [];
  console.log({ song });
  // Remove stuff like - Original mix or - club edition for easier check later
  let modifiedSong = removeCharactersAfterCharacterInString(song, " -");

  try {
    await spotifyApi
      // Search for tracks by the artist depending on what song is playing
      .searchTracks(artist, { limit: 50, offset: 0 })
      .then((data) => {
        // Filter out the songs that have the same name, don't have the same artist and if the song is already in the filtered array There must be a better way to do this
        console.log({ modifiedSong, artist });
        data.body.tracks.items.forEach((element) => {
          // console.log(`\x1b[36m%s\x1b[0m', Song: ${element.name}`);
          // console.log(`\x1b[31m%s\x1b[0m', Artist: ${element.artists[0].name}`);
          // console.log("");
          if (
            !element.name.includes(modifiedSong || song) &&
            element.artists[0].name == artist &&
            filteredPlaylist.some((e) => e.song === element.name) === false
          ) {
            // Push the alternatives in an array
            filteredPlaylist.push({
              song: element.name,
              image: element.album.images[1].url,
              artist: element.artists[0].name,
            });
          }
        });
      });
  } catch (error) {
    console.error({ error });
  }
  // Check if the filteredPlaylist is empty, if it is, search for more songs by the artist top tracks
  if (filteredPlaylist.length < 3) {
    let moreSongs = await ifSongsFromSearchByArtistDidNotReturnEnough(id);
    // Push the more songs to the filteredPlaylist if the song name is not already in the filteredPlaylist
    moreSongs.forEach((element) => {
      if (
        filteredPlaylist.some((e) => e.song === element.song) === false &&
        element.song !== song
      ) {
        filteredPlaylist.push(element);
      }
    });
  }
  // Shuffle it so the results vary from time to time
  shuffleArray(filteredPlaylist);
  // Push only three alternatives to return
  for (let i = 0; i < 3; i++) {
    alternativesArray.push(filteredPlaylist[i]);
  }
  return alternativesArray;
}

async function ifSongsFromSearchByArtistDidNotReturnEnough(artist) {
  let moreSongs = [];
  console.log({ artist });
  try {
    await spotifyApi.getArtistTopTracks(artist, "SE").then((data) => {
      data.body.tracks.forEach((element) => {
        moreSongs.push({
          song: element.name,
          image: element.album.images[1].url,
          artist: element.artists[0].name,
        });
      });
    });
  } catch (error) {
    console.error({ error });
  }
  return moreSongs;
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
