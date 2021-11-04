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
  return data;
};
// Create the alternatives and the answer
var createListOfAlternatives = async () => {
  let alternatives = await getAlternatives();
  let answer = await getAnswer();
  quizWrapper.innerHTML = "";
  createAlternatives(answer);
  createAudio(answer.previewUrl);
  alternatives.forEach((item) => createAlternatives(item));
  setCorrectAnswer();
};

async function setCorrectAnswer() {
  let answer = await getAnswer();
  const cards = document.querySelectorAll(".flip-card");
  cards.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.toggle("flip");
      if (item.innerText === answer.song) {
        item.classList.add("correct");
        setTimeout(() => {
          window.location.href = "./login";
        }, 5000);
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
