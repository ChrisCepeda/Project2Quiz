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
// Get the preview url from the backend
var getPreviewUrl = async () => {
  let res = await fetch(`./previewUrl`);
  let data = await res.json();
  return data;
};
// Create the alternatives and the answer
var createListOfAlternatives = async () => {
  let alternatives = await getAlternatives();
  let answer = await getAnswer();
  let url = await getPreviewUrl();
  quizWrapper.innerHTML = "";
  createAlternatives(formatJSON(answer));
  createAudio(url);
  alternatives.forEach((item) => {
    createAlternatives(formatJSON(item));
  });
};
// Create the audio element, add the source and play the audio. It will autoplay!!!!
var createAudio = async (url) => {
  document.querySelector(".audio").innerHTML = `
  <audio autoplay controls>
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
      <p>${item.name}</p>
    </div>
    </div>
    <div class="flip-card-back"></div>
  </div>
</div>
  `;
};
// Format the JSON to a more readable format and error handling
var formatJSON = (data) => {
  const formated = {
    name: data.name ? data.name : "Undefined",
    artists: data.album.artists[0].name ? data.album.artists[0].name : "Undefined",
    link: data.album.artists[0].external_urls.spotify
      ? data.album.artists[0].external_urls.spotify
      : "Undefined",
    image: data.album.images[1].url ? data.album.images[1].url : "Undefined",
  };
  return formated;
};
