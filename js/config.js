const firebaseConfig = {
  apiKey: "AIzaSyBvD9woTeDnVG2Du-q_FcSngKImjJ3L2pI",
  authDomain: "prode-mundial26-12791.firebaseapp.com",
  projectId: "prode-mundial26-12791",
  storageBucket: "prode-mundial26-12791.firebasestorage.app",
  messagingSenderId: "332809365371",
  appId: "1:332809365371:web:84490d800f2ada72e9ffde"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const Timestamp = firebase.firestore.Timestamp;
