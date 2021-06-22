import firebase from "firebase";
require('@firebase/firestore');

var firebaseConfig = {
  apiKey: "AIzaSyAvxOzw9b8tSVkUJJ4DkQB6bmRjUT38ITo",
  authDomain: "willy-cdf16.firebaseapp.com",
  projectId: "willy-cdf16",
  storageBucket: "willy-cdf16.appspot.com",
  messagingSenderId: "376968452984",
  appId: "1:376968452984:web:62986fb4df0607de97868d"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();