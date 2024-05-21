// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBRhiWKyJ0tGhsLPRBXGW4TBRALbtPVH0U",
    authDomain: "uvi-eventos-3edef.firebaseapp.com",
    databaseURL: "https://uvi-eventos-3edef-default-rtdb.firebaseio.com",
    projectId: "uvi-eventos-3edef",
    storageBucket: "uvi-eventos-3edef.appspot.com",
    messagingSenderId: "824370590437",
    appId: "1:824370590437:web:13eeb612abbe1533ec5a0c",
    measurementId: "G-0TCV2R35FY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;