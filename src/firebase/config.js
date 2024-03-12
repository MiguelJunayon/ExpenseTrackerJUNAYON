import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCD1i-hfadxHfh0VwjKd-bpTW1EEyth_AI",
  authDomain: "tracker-a8da2.firebaseapp.com",
  projectId: "tracker-a8da2",
  storageBucket: "tracker-a8da2.appspot.com",
  messagingSenderId: "701193322035",
  appId: "1:701193322035:web:8034a01f8e3ec2c3056d46",
  measurementId: "G-FVLTWC4LY2"
};

initializeApp(firebaseConfig);

const db = getFirestore();

export default db