import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, query, where} from 'firebase/firestore';

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
  getPeople()
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

const people = []; //to hold all the people from the collection

async function getPeople(){
  //call this from DOMContentLoaded init function 
  //the db variable is the one created by the getFirestore(app) call.
  const querySnapshot = await getDocs(collection(db, 'people'));
  querySnapshot.forEach((doc) => {
    //every `doc` object has a `id` property that holds the `_id` value from Firestore.
    //every `doc` object has a doc() method that gives you a JS object with all the properties
    const data = doc.data();
    const id = doc.id;
    getIdeas(id)
    people.push({id, ...data});
  });
  buildPeople(people);
}

const gifts = []; //to hold all the gifts from the collection

// async function getIdeas(id){
//   //get an actual reference to the person document 
//   const personRef = doc(collection(db, 'people'), id);
//   //then run a query where the `person-id` property matches the reference for the person
//   const docs = query(
//     collection(db, 'gift-ideas'),
//     where('person-id', '==', personRef)
//   );
//   const querySnapshot = await getDocs(docs);

//   querySnapshot.forEach((doc) => { 
//     //work with the resulting docs
//   });
// } 

async function getIdeas(){
  //call this from DOMContentLoaded init function 
  //the db variable is the one created by the getFirestore(app) call.
  const querySnapshot = await getDocs(collection(db, 'gift-ideas'));
  querySnapshot.forEach((doc) => {
    //every `doc` object has a `id` property that holds the `_id` value from Firestore.
    //every `doc` object has a doc() method that gives you a JS object with all the properties
    const data = doc.data();
    const id = doc.id;
    gifts.push({id, ...data});
  });
  buildGifts(gifts);
}

function buildPeople(people){
  //build the HTML
  let ul = document.querySelector('ul.person-list');
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  //replace the old ul contents with the new.
  ul.innerHTML = people.map(person=>{
    const dob = `${months[person['birth-month']-1]} ${person['birth-day']}`;
    //Use the number of the birth-month less 1 as the index for the months array
    return `<li data-id="${person.id}" class="person">
            <p class="name">${person.name}</p>
            <p class="dob">${dob}</p>
          </li>`;
  }).join('');
}

function buildGifts(gifts){
  //build the HTML
  let ul = document.querySelector('ul.idea-list');
  //replace the old ul contents with the new.
  ul.innerHTML = gifts.map(gift => {
    //Use the number of the birth-month less 1 as the index for the months array
    // return `<li data-id="${gift.id}" class="idea">
    //         <p class="name">${gift.name}</p>
    //         <p class="dob">${gift.location}</p>
    //       </li>`;

    return `<li class="idea" data-id="${gift.id}">
            <label for="chk-uniqueid"
              ><input type="checkbox" id="chk-uniqueid" /> Bought</label
            >
            <p class="title">${gift.idea}</p>
            <p class="location">${gift.location}</p>
          </li>`
  }).join('');
}
