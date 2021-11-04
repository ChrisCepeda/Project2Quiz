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

const authBlock = document.querySelector("#auth");
const logOutBtn = document.querySelector(".logOut-btn");

firebase.auth().onAuthStateChanged(function (user) {
  const authBlock = document.querySelector("#auth");
  if (user) {
    authBlock.classList = "auth--authenticated";
  } else {
    authBlock.classList = "auth--anonymous";
  }
});

const loginForm = document.querySelector("#login");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.querySelector("#email_field").value;
  const password = document.querySelector("#password_field").value;
  console.log(email, password);
  loginForm.reset();
  logInUser(email, password);
});

function logInUser(email, password) {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      //var user = userCredential.user.email;
    })
    .catch((error) => {
      //var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
    });
  if (startGameBtn.classList.contains("hide")) {
    startGameBtn.innerText = "Start quiz";
    startGameBtn.classList.remove("hide");
  }
  questionElement.classList = "hide";
  answersElement.classList = "hide";
  scoreContainer.classList = "hide";
}

const newMemberForm = document.querySelector("#register");
newMemberForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const signUpEmail = document.querySelector("#email_signup").value;
  const signUpPassword = document.querySelector("#password_signup").value;
  newMemberForm.reset();
  newMember(signUpEmail, signUpPassword);
});

function newMember(signUpEmail, signUpPassword) {
  firebase
    .auth()
    .createUserWithEmailAndPassword(signUpEmail, signUpPassword)
    .then((userCredential) => {
      // Signed in
      //var user = userCredential;
    })
    .catch((error) => {
      //var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
    });
  if (startGameBtn.classList.contains("hide")) {
    startGameBtn.innerText = "Start quiz";
    startGameBtn.classList.remove("hide");
  }
  questionElement.classList = "hide";
  answersElement.classList = "hide";
  scoreContainer.classList = "hide";
}

logOutBtn.addEventListener("click", logOut);

function logOut() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      //highscoreContainer.classList = 'hide';
      //scoreContainer.classList = 'hide';
      //startGameBtn.innerText = "Start quiz";
    })
    .catch((error) => {
      // An error happened.
    });
}

//QUIZ CODE BELOW

const questionElement = document.querySelector(".question");
const answersElement = document.querySelector(".answers-container");
const startGameBtn = document.querySelector(".startGame-btn");
const nextQuestionBtn = document.querySelector(".nextQuestion-btn");
const scoreContainer = document.querySelector(".score-div");
const highscoreContainer = document.querySelector("#highscore");
let shuffledQuestions, currentQuestionIndex;
nextQuestionBtn.classList = "hide";
//highscoreContainer.classList = "hide";
let score = 0;

startGameBtn.addEventListener("click", startGame);

function startGame() {
  score = 0;
  (scoreContainer.innerText = "score: "), score;
  scoreContainer.classList.remove("hide");
  //console.log("Game started");
  startGameBtn.classList = "hide";
  highscoreContainer.classList = "hide";
  questionElement.classList.remove("hide");
  answersElement.classList.remove("hide");
  shuffledQuestions = questions.sort(() => Math.random - 0.5); // supposed to randomize questions but not working? better to do like in quiz?
  currentQuestionIndex = 0;
  setNextQuestion();
}

function setNextQuestion() {
  resetState();
  showQuestion(shuffledQuestions[currentQuestionIndex]);
}

function showQuestion(question) {
  questionElement.innerText = question.question;
  question.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.setAttribute("class", "answerButton"); // setting class so i can select these buttons later
    button.innerText = answer.text;
    if (answer.correct) {
      button.dataset.correct = answer.correct; //giving correct answer alt dataset of correct
    }
    button.addEventListener("click", selectAnswer);
    answersElement.appendChild(button);
  });
}

function resetState() {
  nextQuestionBtn.classList.add("hide");
  while (answersElement.firstChild) {
    // = when there is a question showing
    answersElement.removeChild(answersElement.firstChild); //how come all answers disapperas when targetting only first child?
  }
}

function showHighscore(doc) {
  let li = document.createElement("li");
  let name = document.createElement("span");
  let score = document.createElement("span");
  name.textContent = doc.data().name;
  score.textContent = doc.data().score;

  li.appendChild(name);
  li.appendChild(score);
  highscoreContainer.appendChild(li);
}

function selectAnswer(e) {
  startGameBtn.classList = "hide";
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct; //selecting answer w dataset of correct
  setStatusClass(correct);
  Array.from(answersElement).forEach((button) => {
    setStatusClass(button, button.dataset.correct);
  });
  if (shuffledQuestions.length > currentQuestionIndex + 1) {
    //if there are questions left
    nextQuestionBtn.classList.remove("hide");
  } else {
    scoreContainer.innerText = `Good job! You scored ${score} points! Total highscore:`;
    startGameBtn.innerText = "Restart";
    startGameBtn.classList.remove("hide");
    highscoreContainer.classList.remove("hide");
    questionElement.classList.add("hide");
    answersElement.classList.add("hide");

    const user = firebase.auth().currentUser.email;
    storeScoreInFb(user, score);
    db.collection("highscore")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          showHighscore(doc);
        });
      });
  }
}

function storeScoreInFb(user, score) {
  db.collection("highscore").add({
    name: user,
    score: score,
  });
}

function setStatusClass(correct) {
  if (correct) {
    score++;
    scoreContainer.innerText = "score: " + score;
    const answerButtons = document.querySelectorAll(".answerButton"); //make a function of this for reusability
    for (const button of answerButtons) {
      button.removeEventListener("click", selectAnswer);
    }
  } else {
    const answerButtons = document.querySelectorAll(".answerButton"); //make a function of this for reusability
    for (const button of answerButtons) {
      button.removeEventListener("click", selectAnswer);
    }
  }
}

nextQuestionBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestion();
});

const questions = [
  //probably more elegant to store in seperate json?
  {
    question: "2+2 = ?",
    answers: [
      { text: "2", correct: false },
      { text: "4", correct: true },
    ],
  },
  {
    question: "1+2 = ?",
    answers: [
      { text: "3", correct: true },
      { text: "4", correct: false },
    ],
  },
  {
    question: "2+3 = ?",
    answers: [
      { text: "5", correct: true },
      { text: "4", correct: false },
    ],
  },
  {
    question: "3+3 = ?",
    answers: [
      { text: "5", correct: false },
      { text: "6", correct: true },
    ],
  },
];
