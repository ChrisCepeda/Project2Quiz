const quizWrapper = document.querySelector(".quiz-container");
// Get the alternatives from the backend and send the artist and song from the answer so we can have some alternatives relative to the song thats playing
var getAlternatives = async (artist, song) => {
  let res = await fetch(`./fetchFromSpotify_alternatives?artist=${artist}&song=${song}`);
  let data = res.json();

  return data;
};
// Get the answer from the backend
var getAnswer = async () => {
  let res = await fetch(`./fetchFromSpotify_answer`);
  let data = await res.json();
  console.log({ data });
  return data;
};
// Create the alternatives and the answer
var createListOfAlternatives = async () => {
  // Get the answer from the backend
  let answer = await getAnswer();
  // Get the alternatives from the backend and send the artist and song from the answer so we can have some alternatives relative to the song thats playing
  let alternatives = await getAlternatives(answer[0].artist, answer[0].song);
  quizWrapper.innerHTML = "";
  // Create the alternatives
  createAlternatives(answer[0]);
  // Create the audio element
  createAudio(answer[0].previewUrl);
  // Create the alternatives
  alternatives.forEach((item) => createAlternatives(item));
  // Shuffle the cards
  shuffleCards();
  // Add the event listener to the cards
  intializeAlternativesWithEventlistener(answer);
};

function intializeAlternativesWithEventlistener(answer) {
  // Get all the cards
  var cards = document.querySelectorAll(".flip-card");
  // Loop through the cards and add the event listener
  cards.forEach((card) => {
    card.addEventListener("click", function () {
      card.classList.toggle("flip");
      console.log(answer[0].song + " " + answer[0].artist);
      console.log(card.innerText);
      // Check if the answer is correct
      if (answer[0].song + " by " + answer[0].artist == card.innerText) {
        card.classList.add("correct");
        // Send the user to the next question
        setTimeout(() => {
          window.location = "./login";
        }, 1000);
      }
    });
  });
}

// Create the audio element
var createAudio = async (url) => {
  document.querySelector(".audio").innerHTML = `
  <audio autoplay>
    <source src="${url}" type="audio/mp3">
  </audio>  
  `;
};

// Create the HTML for the alternatives
var createAlternatives = async (item) => {
  quizWrapper.innerHTML += `
  <div class="flip-card">
  <div class="flip-card-inner">
    <div class="flip-card-front">
    <img src="${item.image}"> 
    <div class="card-name">
      <p>${item.song} by ${item.artist}</p>
    </div>
    </div>
    <div class="flip-card-back"></div>
  </div>
</div>
  `;
};

function shuffleCards() {
  //IIFE
  const cards = document.querySelectorAll(".flip-card");
  console.log(cards);
  cards.forEach((card) => {
    let ramdomPos = Math.floor(Math.random() * 4);
    console.log(ramdomPos);
    card.style.order = ramdomPos;
  });
}
