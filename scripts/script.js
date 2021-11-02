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
const authBlock = document.querySelector("#auth");
const logOutBtn = document.querySelector(".logOut-btn");

/*firebase.auth().onAuthStateChanged(function (user) {
  /*const notLoggedIn = document.querySelector(".loggedOut");
  const loggedIn = document.querySelector(".loggedIn");
  const signUp = document.querySelector(".signUp");
  const authBlock = document.querySelector("#auth");
  if (!user) {
    console.log("ok");
    authBlock.classList = "auth--authenticated";
  } else {
    authBlock.classList.remove = "auth--anonymous";
  }
}) */ 

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
  //console.log(email, password);
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      console.log("now logged in");
      alert("welcome!");
      authBlock.classList = "auth--authenticated";
      // ...
    })
    .catch((error) => {
      //var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
    });
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
      alert("welcome new member");
      //var user = userCredential;
      authBlock.classList = "auth--authenticated";
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      // ..
    });
}

logOutBtn.addEventListener("click", logOut);

function logOut() {
  //console.log("bye");
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      alert("goodbye!");
      authBlock.classList = "auth--anonymous";
    })
    .catch((error) => {
      // An error happened.
    });
}

/*

const questions = [
  {
    question: "Question 1",
    answers: [
      { text1: 1 },
      { text2: 2 },
      { text3: 3 },
      { text4: 4 },
      { answer: 1 },
    ],
  },
  {
    question: "Question 2",
    answers: [
      { text1: 1 },
      { text2: 2 },
      { text3: 3 },
      { text4: 4 },
      { answer: 1 },
    ],
  },
  {
    question: "Question 3",
    answers: [
      { text1: 1 },
           { text2: 2 },
      { text3: 3 },
      { text4: 4 },
      { answer: 1 },
       ],
  },
]; */