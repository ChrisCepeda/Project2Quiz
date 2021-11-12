const quizWrapper = document.querySelector(".quiz-container");
const loader = document.getElementById("loader");
const game = document.getElementById("game");
const progressBarFull = document.getElementById("progressBarFull");
const scoreHud = document.querySelector("#score-display");
const gameContainer = document.querySelector(".game-container");
const highscoreContainer = document.querySelector(".highscore-container");
const startGameBtn = document.querySelectorAll(".start-game");
let choosenplaylist = "";
startGameBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    choosenplaylist = btn.dataset.playlist;
    sessionStorage.setItem("choosenplaylist", choosenplaylist);
  });
});
window.onload = startQuiz();
import { storeAndShowFirestoreData } from "./firstPage.js";
// Setting to global variables
// Get the alternatives from the backend and send the artist and song from the answer so we can have some alternatives relative to the song thats playing
async function getAlternatives(artist, song, id) {
  artist = artist.replace("&", "and");
  let res = await fetch(`./fetchFromSpotify_alternatives?artist=${artist}&song=${song}&id=${id}`);
  let data = res.json();
  return data;
}
// Get the answer from the backend
async function getAnswer() {
  let res = await fetch(`./fetchFromSpotify_answer?playlist=${choosenplaylist}`);
  let data = await res.json();
  return data;
}
let playList = [];
let index = 0;
let score = 0;
const maxNumberOfQuestions = 10;
const timeLeft = 10;
let previewSongTime = timeLeft;
let timer;

window.history.pushState({}, null, "/");

async function startQuiz() {
  choosenplaylist = sessionStorage.getItem("choosenplaylist");
  playList = await getAnswer(choosenplaylist);
  shuffleArray(playList);
  // Hide loader AFTER loading in new question
  game.classList.remove("hidden");
  createListOfAlternatives();
  loader.classList.add("hidden");
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
async function createListOfAlternatives() {
  //Update the progress bar
  if (index === maxNumberOfQuestions) {
    gameOver();
    return;
  }
  let alternatives = await getAlternatives(
    playList[index].artists[0].name,
    playList[index].name,
    playList[index].artists[0].id
  );
  quizWrapper.innerHTML = ``;
  createAlternatives(formatAndErrorHandle(playList[index]));
  alternatives.forEach((item) => createAlternatives(formatAndErrorHandle(item)));
  shuffleAndInitializeCards();
  setTimeout(() => {
    createAudio(playList[index].preview_url);
  }, 500);
  timer = setInterval(countdownTimerForSongs, 10);
}

function shuffleAndInitializeCards() {
  shuffleCards();
  intializeAlternativesWithEventlistener();
}

function intializeAlternativesWithEventlistener() {
  var cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("click", checkIfTheAnswerIsCorrect);
  });
}

function checkIfTheAnswerIsCorrect() {
  let cardToCheck = this;
  if (playList[index].name + " by " + playList[index].artists[0].name === cardToCheck.innerText) {
    cardToCheck.classList.add("correct");
    score += 10;
    scoreHud.innerText = score;
  } else {
    cardToCheck.classList.add("incorrect");
  }
  pauseAudioAndResetCards();
}

function gameOver() {
  sessionStorage.setItem("score", score);
  storeAndShowFirestoreData();
  gameContainer.innerHTML = "";
  highscoreContainer.innerHTML = `
  <div class="container">
  <div id="highScores" class="flex-center flex-column">
    <h1 id="finalScore">High Scores</h1>
    <ul id="highScoresList">
    </ul>
    <a href="./chooseTheme.html" class="btn">Go Home</a>
  </div>
</div>
  `;
}

function pauseAudioAndResetCards() {
  removeEventListenerFromCards();
  pauseAudioAndgetCurrentTimeInAudio();
}
function pauseAudioAndgetCurrentTimeInAudio() {
  setTimeout(pauseAudio, 500);
}

function removeEventListenerFromCards() {
  var cards = document.querySelectorAll(".card");
  cards.forEach((card) => card.removeEventListener("click", checkIfTheAnswerIsCorrect));
}

function countdownTimerForSongs() {
  previewSongTime -= 0.01;
  progressBarFull.style.width = `${(previewSongTime / maxNumberOfQuestions) * 100}%`;
  if (previewSongTime <= 0) stopTimer();
}

function stopTimer() {
  clearInterval(timer);
  previewSongTime = timeLeft;
  stopVinyls();
  index++;
  createListOfAlternatives();
}

function pauseAudio() {
  let currentTime = document.querySelector("#audio").currentTime;
  stopTimer();
  // Maybe do something with the currentTime and scoring?
  console.log("Song was paused on : ", currentTime);
  document.querySelector("#audio").pause();
}

function stopVinyls() {
  let allVinyls = document.querySelectorAll(".card__image");
  allVinyls.forEach((vinyl) => (vinyl.style.animationPlayState = "paused"));
}

function startVinlys() {
  let allVinyls = document.querySelectorAll(".card__image");
  allVinyls.forEach((vinyl) => (vinyl.style.animationPlayState = "running"));
}
// Create the audio element
var createAudio = async (url) => {
  document.querySelector(".audio").innerHTML = `
  <audio id="audio" autoplay>
    <source src="${url}" type="audio/mp3">
  </audio>  
  `;
  document.querySelector("#audio").volume = 1;
  startVinlys();
};

// Create the HTML for the alternatives
var createAlternatives = async (track) => {
  quizWrapper.innerHTML += `
  <div class="card">
    <div class="card__image">
    <div class="line inner"></div>
    <div class="line middle"></div>
    <div class="line outer"></div>
    <div class="dot"></div>
      <img src="${track.image}">
      <div class="vinal-shine"></div>
    </div>
    <div class="card__content">
      <p>${track.trackName} by ${track.artist}</p>
    </div>
  </div>
  `;
};

function formatAndErrorHandle(item) {
  if (item === null) return;
  let formated = {
    image: item.album.images[1].url ? item.album.images[1].url : "null",
    trackName: item.name ? item.name : "Undefined",
    artist: item.artists[0].name ? item.artists[0].name : "Undefined",
  };
  return formated;
}

function shuffleCards() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    let ramdomPos = Math.floor(Math.random() * 4);
    card.style.order = ramdomPos;
  });
}
