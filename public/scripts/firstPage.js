// Firebase auth
const firebaseConfig = {
  apiKey: "AIzaSyCOdgM7ZJOumY9SU3Jxm5k6qSojlLaGCdg",
  authDomain: "hitest-1cac8.firebaseapp.com",
  projectId: "hitest-1cac8",
  storageBucket: "hitest-1cac8.appspot.com",
  messagingSenderId: "1050851890616",
  appId: "1:1050851890616:web:165b84de6f6bd507d46b4d",
  measurementId: "G-RNY5B67T2Q",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });
// Functions regarding firestore storage/retrieval
sessionStorage.setItem("score", 0);

export function storeAndShowFirestoreData() {
  // collector function for storing and showcasing data
  let score = JSON.parse(sessionStorage.getItem("score"));
  const user = firebase.auth().currentUser.email; //get the current user signed in
  storeScoreInFireStore(user, score); //storing function
  db.collection("highscore")
    .limit(5)
    .orderBy("score", "desc") // getting each docucent/saved score and running a function on each
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        showHighscore(doc);
      });
    });
}
let username = "";
function storeScoreInFireStore(user, score) {
  // storing name and score to firestore
  db.collection("highscore").add({
    name: user,
    score: score,
    username: username,
  });
}

function showHighscore(doc) {
  const highscoreList = document.querySelector("#highScoresList");
  let li = document.createElement("li");
  li.classList.add("high-score");
  let name = document.createElement("span");
  // let username = document.createElement("span");
  let score = document.createElement("span");
  name.textContent = doc.data().name + ": ";
  // username.textContent = doc.data().username + ": ";
  score.textContent = doc.data().score + " points";

  li.appendChild(name);
  // li.appendChild(username);
  li.appendChild(score);
  highscoreList.appendChild(li);
}

/*


/*const questionElement = document.querySelector(".question");
const answersElement = document.querySelector(".answers-container");
//const startGameBtn = document.querySelector(".startGame-btn");
const nextQuestionBtn = document.querySelector(".nextQuestion-btn");
const scoreContainer = document.querySelector(".score-div");
const highscoreContainer = document.querySelector("#highscore");
let shuffledQuestions, currentQuestionIndex;
let score = 0;*/

/*function resetGame() {
  //to get the right button to show/hide
  //startGameBtn.innerText = "Start quiz";
  //startGameBtn.classList.remove("hide");
  questionElement.classList = "hide";
  answersElement.classList = "hide";
  scoreContainer.classList = "hide";
  nextQuestionBtn.classList = "hide";
  highscoreContainer.classList = "hide";
  highscoreContainer.innerText = ""; //clear the highscore between games so it doesnt print same score multiple times
}


startGameBtn.addEventListener("click", startGame); //start the game
function startGame() {
  resetGame(); //to reset when user restarts the game
  score = 0;
  (scoreContainer.innerText = "score: "), score; //why brackets appearing when formatting??
  scoreContainer.classList.remove("hide");
  startGameBtn.classList = "hide";
  questionElement.classList.remove("hide");
  answersElement.classList.remove("hide");
  shuffledQuestions = questions.sort(() => Math.random - 0.5); // supposed to randomize questions but not working? better to do like in quiz?
  currentQuestionIndex = 0;
  setNextQuestion();
} 

function setNextQuestion() {
  lockBoard();
  showQuestion(shuffledQuestions[currentQuestionIndex]);
}

function showQuestion(question) {
  // creating the questions from questions object
  questionElement.innerText = question.question; //putting in the question
  question.answers.forEach((answer) => {
    //creating buttons and adding the answers
    const button = document.createElement("button");
    button.setAttribute("class", "answerButton"); // setting class so i can select these buttons later
    button.innerText = answer.text;
    //if (answer.correct) {
      button.dataset.correct = answer.correct; //giving the correct answer option a dataset of correct
    //}
    answersElement.appendChild(button);
    button.addEventListener("click", selectAnswer);
  });
}

function lockBoard() {
  // so the user cant skip a question
  nextQuestionBtn.classList.add("hide");
  while (answersElement.firstChild) {
    // = if there is a current question/answers
    answersElement.removeChild(answersElement.firstChild); //how come all answers disapperas when targetting only first child?
  }
}

function selectAnswer(e) {
  startGameBtn.classList = "hide"; //hiding startbutton when answering first question
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct; //selecting answer w dataset of correct
  setStatusClass(correct); // log answer as correct or wrong
  Array.from(answersElement).forEach((button) => {
    setStatusClass(button, button.dataset.correct);
  });
  if (shuffledQuestions.length > currentQuestionIndex + 1) {
    //if there are questions left
    nextQuestionBtn.classList.remove("hide"); // show next question
  } else {
    //if no question left
    whenGameFinished();
    storeAndShowFirestoreData();
  }
}

function setStatusClass(correct) {
  // updates the score +
  if (correct) {
    score++;
    scoreContainer.innerText = "score: " + score;
    disableAnswerButton();
  } else {
    disableAnswerButton();
  }
}

nextQuestionBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestion();
});

function disableAnswerButton() {
  // to lock the answer buttons after one click
  const answerButtons = document.querySelectorAll(".answerButton");
  for (const button of answerButtons) {
    button.removeEventListener("click", selectAnswer);
  }
}

function whenGameFinished() {
  scoreContainer.innerText = `Good job! You scored ${score} points! Total highscore:`;
  //startGameBtn.innerText = "Restart"; //change from start to restart
  //startGameBtn.classList.remove("hide");
  highscoreContainer.classList.remove("hide");
  questionElement.classList.add("hide");
  answersElement.classList.add("hide");
} */
