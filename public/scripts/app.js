const quizWrapper = document.querySelector(".quiz-container");
// Setting to global variables
let playList = [];
let index = 0;
let score = 0;
let previewSongTime = 30;
let timer;
window.history.pushState({}, null, "/");
// Get the alternatives from the backend and send the artist and song from the answer so we can have some alternatives relative to the song thats playing
async function getAlternatives(artist, song, id) {
  artist = artist.replace("&", "and");
  let res = await fetch(`./fetchFromSpotify_alternatives?artist=${artist}&song=${song}&id=${id}`);
  let data = res.json();
  return data;
}
// Get the answer from the backend
async function getAnswer() {
  let res = await fetch(`./fetchFromSpotify_answer`);
  let data = await res.json();
  return data;
}
// Create the alternatives and the answer
async function startQuiz() {
  playList = await getAnswer();
  createListOfAlternatives();
}
async function createListOfAlternatives() {
  let alternatives = await getAlternatives(playList[index].artists[0].name, playList[index].name);
  quizWrapper.innerHTML = `<h1>Name the song:) : Score: ${score}</h1>`;
  createAlternatives(formatAndErrorHandle(playList[index]));
  alternatives.forEach((item) => createAlternatives(formatAndErrorHandle(item)));
  shuffleAndInitializeCards();
  setTimeout(() => {
    createAudio(playList[index].preview_url);
  }, 500);
  timer = setInterval(countdownTimerForSongs, 1000);
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
  console.log(playList[index]);
  console.log(cardToCheck.innerText);
  if (playList[index].name + " by " + playList[index].artists[0].name === cardToCheck.innerText) {
    cardToCheck.classList.add("correct");
    score++;
  } else {
    cardToCheck.classList.add("incorrect");
  }
  index++;
  pauseAudioAndResetCards();
  setTimeout(createListOfAlternatives, 1500);
}

function gameOver() {
  if (index === playList.length) {
    quizWrapper.innerHTML = `
    <h1>Game Over</h1>
    <h2>Your score is: ${score}</h2>
    <button onclick="window.location.reload()">Play again</button>
    `;
  }
}

function pauseAudioAndResetCards() {
  removeEventListenerFromCards();
  pauseAudioAndgetCurrentTimeInAudio();
}
function pauseAudioAndgetCurrentTimeInAudio() {
  setTimeout(pauseAudio, 500);
  stopTimer();
}

function removeEventListenerFromCards() {
  var cards = document.querySelectorAll(".card");
  cards.forEach((card) => card.removeEventListener("click", checkIfTheAnswerIsCorrect));
}

function countdownTimerForSongs() {
  previewSongTime--;
  if (previewSongTime <= 0) stopTimer();
}

function stopTimer() {
  clearInterval(timer);
  previewSongTime = 30;
  stopVinyls();
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
