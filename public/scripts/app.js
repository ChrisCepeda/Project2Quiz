const quizWrapper = document.querySelector(".quiz-container");
// Setting to global variables
let answer;
let cardToCheck;
let previewSongTime = 30;
let timer;
// Get the alternatives from the backend and send the artist and song from the answer so we can have some alternatives relative to the song thats playing
var getAlternatives = async (artist, song, id) => {
  // For some reason when passing the & character the string that came out was divided in three parts, messing with the alternatives
  artist = artist.replace("&", "and");
  let res = await fetch(`./fetchFromSpotify_alternatives?artist=${artist}&song=${song}&id=${id}`);
  let data = res.json();
  return data;
};
// Get the answer from the backend
var getAnswer = async () => {
  let res = await fetch(`./fetchFromSpotify_answer`);
  let data = await res.json();
  return data;
};
// Create the alternatives and the answer
var createListOfAlternatives = async () => {
  // Get the answer from the backend
  answer = await getAnswer();
  console.log(answer);
  // Get the alternatives from the backend and send the artist and song from the answer so we can have some alternatives relative to the song thats playing
  let alternatives = await getAlternatives(answer[0].artist, answer[0].song, answer[0].artistId);
  quizWrapper.innerHTML = " <h1>Name the song:)</h1>";
  // Create the alternatives
  alternatives.forEach((item) => createAlternatives(formatAndErrorHandle(item)));
  // Create the answer
  createAlternatives(formatAndErrorHandle(answer[0]));
  // Shuffle the cards
  shuffleCards();
  // Add the event listener to the cards
  intializeAlternativesWithEventlistener();
  // Create the audio element
  setTimeout(() => {
    createAudio(answer[0].previewUrl);
  }, 500);
  timer = setInterval(countdownTimerForSongs, 1000);
};

function intializeAlternativesWithEventlistener() {
  // Get all the cards
  var cards = document.querySelectorAll(".card");
  // Loop through the cards and add the event listener
  cards.forEach((card) => {
    card.addEventListener("click", checkIfTheAnswerIsCorrect);
  });
}

function checkIfTheAnswerIsCorrect() {
  cardToCheck = this;
  if (answer[0].song + " by " + answer[0].artist === cardToCheck.innerText) {
    cardToCheck.classList.toggle("correct");
    // Send the user to the next question
    pauseAudioAndgetCurrentTimeInAudio();
    setTimeout(createListOfAlternatives, 2000);
  } else {
    cardToCheck.classList.toggle("incorrect");
    // Send the user to the next question
    pauseAudioAndgetCurrentTimeInAudio();
    setTimeout(createListOfAlternatives, 2000);
  }
  removeEventListenerFromCards();
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
// Create the audio element
var createAudio = async (url) => {
  document.querySelector(".audio").innerHTML = `
  <audio id="audio" autoplay>
    <source src="${url}" type="audio/mp3">
  </audio>  
  `;
  document.querySelector("#audio").volume = 1;
  let allVinyls = document.querySelectorAll(".card__image");
  allVinyls.forEach((vinyl) => (vinyl.style.animationPlayState = "running"));
};

// Create the HTML for the alternatives
var createAlternatives = async (item) => {
  quizWrapper.innerHTML += `
  <div class="card">
    <div class="card__image">
    <div class="line inner"></div>
    <div class="line middle"></div>
    <div class="line outer"></div>
    <div class="dot"></div>
      <img src="${item.image}">
      <div class="vinal-shine"></div>
    </div>
    <div class="card__content">
      <p>${item.song} by ${item.artist}</p>
    </div>
  </div>
  `;
};

function formatAndErrorHandle(item) {
  if (item === null) {
    return {
      artist: "Undefined",
      song: "Undefined",
      image: "",
    };
  }
  let formated = {
    image: item.image ? item.image : "null",
    song: item.song ? item.song : "Undefined",
    artist: item.artist ? item.artist : "Undefined",
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
