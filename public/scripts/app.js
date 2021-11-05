const quizWrapper = document.querySelector(".quiz-container");
// Get the alternatives from the backend
var getAlternatives = async () => {
  let res = await fetch(`./fetchFromSpotify_alternatives`);
  let data = res.json();
  return data;
};
// Get the answer from the backend
var getAnswer = async () => {
  let res = await fetch(`./fetchFromSpotify_answer`);
  let data = await res.json();
  console.log(data);
  return data;
};
// Create the alternatives and the answer
var createListOfAlternatives = async () => {
  let alternatives = await getAlternatives();
  let answer = await getAnswer();
  quizWrapper.innerHTML = "";
  createAlternatives(answer[0]);
  createAudio(answer[0].previewUrl);
  alternatives.forEach((item) => createAlternatives(item));
  intializeAlternativesWithEventlistener(answer);
};

function intializeAlternativesWithEventlistener(answer) {
  var cards = document.querySelectorAll(".flip-card");
  cards.forEach((card) => {
    card.addEventListener("click", function () {
      card.classList.toggle("flip");
      if (answer[0].song == card.innerText) {
        card.classList.add("correct");
        console.log(card.innerText);
        console.log(answer[0].song);
      }
    });
  });
}

// Create the audio element
var createAudio = async (url) => {
  document.querySelector(".audio").innerHTML = `
  <audio controls autoplay>
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
      <p>${item.song}</p>
    </div>
    </div>
    <div class="flip-card-back"></div>
  </div>
</div>
  `;
};
