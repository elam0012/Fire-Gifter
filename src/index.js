import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuzvlK2q939LGuhDXP2cLyxDqW81uQE9M",
  authDomain: "fire-giftr-134a8.firebaseapp.com",
  projectId: "fire-giftr-134a8",
  storageBucket: "fire-giftr-134a8.appspot.com",
  messagingSenderId: "1082424702054",
  appId: "1:1082424702054:web:85bda4155ca7159e8d69a7"
};
//TODO: replace this config object with your own

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// get a reference to the database
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  //set up the dom events
  document
    .getElementById('btnCancelPerson')
    .addEventListener('click', hideOverlay);
  document
    .getElementById('btnCancelIdea')
    .addEventListener('click', hideOverlay);
  document.querySelector('.overlay').addEventListener('click', hideOverlay);

  document
    .getElementById('btnAddPerson')
    .addEventListener('click', showOverlay);
  document.getElementById('btnAddIdea').addEventListener('click', showOverlay);
});

function hideOverlay(ev) {
  ev.preventDefault();
  document.querySelector('.overlay').classList.remove('active');
  document
    .querySelectorAll('.overlay dialog')
    .forEach((dialog) => dialog.classList.remove('active'));
}
function showOverlay(ev) {
  ev.preventDefault();
  document.querySelector('.overlay').classList.add('active');
  const id = ev.target.id === 'btnAddPerson' ? 'dlgPerson' : 'dlgIdea';
  //TODO: check that person is selected before adding an idea
  document.getElementById(id).classList.add('active');
}
