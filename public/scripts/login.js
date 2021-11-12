const authBlock = document.querySelector("#auth");
const logOutBtn = document.querySelector(".logOut-btn");

firebase.auth().onAuthStateChanged(function (user) {
  //register if user is logged in/out and hides/shows different content depending on that
  const authBlock = document.querySelector("#auth");
  if (user) {
    authBlock.classList = "auth--authenticated";
  } else {
    authBlock.classList = "auth--anonymous";
  }
});

console.log("hello");

const loginForm = document.querySelector("#login"); //grab information for login function
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.querySelector("#email_field").value;
  const password = document.querySelector("#password_field").value;
  loginForm.reset();
  logInUser(email, password);
});

function logInUser(email, password) {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {})
    .catch((error) => {
      var errorMessage = error.message;
      alert(errorMessage);
    });
}

let username = "";
const newMemberForm = document.querySelector("#register"); // grab information for member reg.
newMemberForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const signUpEmail = document.querySelector("#email_signup").value;
  const signUpPassword = document.querySelector("#password_signup").value;
  username = document.querySelector("#username_field").value;
  newMemberForm.reset();
  newMember(signUpEmail, signUpPassword);
});

function newMember(signUpEmail, signUpPassword) {
  //function new member reg.
  firebase
    .auth()
    .createUserWithEmailAndPassword(signUpEmail, signUpPassword)
    .then((userCredential) => {})
    .catch((error) => {
      var errorMessage = error.message;
      alert(errorMessage);
    });
}

logOutBtn.addEventListener("click", logOut); //user log out
function logOut() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
    });
}
