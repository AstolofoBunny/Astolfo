import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBlc9uBfGYL1RNBh9-oMIqNKTwcfcWkt7c",
  authDomain: "astolfo-podval4k.firebaseapp.com",
  projectId: "astolfo-podval4k",
  storageBucket: "astolfo-podval4k.firebasestorage.app",
  messagingSenderId: "318980963399",
  appId: "1:318980963399:web:2208221794760fac250562",
  measurementId: "G-0P354W0KDR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
