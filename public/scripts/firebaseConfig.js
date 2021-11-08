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
