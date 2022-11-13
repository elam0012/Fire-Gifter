import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, query, where, addDoc, deleteDoc, onSnapshot, updateDoc, getDoc} from 'firebase/firestore';
let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let giftId // to pass gift-id to edit and delete functions

const firebaseConfig = {
  apiKey: "AIzaSyDuzvlK2q939LGuhDXP2cLyxDqW81uQE9M",
  authDomain: "fire-giftr-134a8.firebaseapp.com",
  projectId: "fire-giftr-134a8",
  storageBucket: "fire-giftr-134a8.appspot.com",
  messagingSenderId: "1082424702054",
  appId: "1:1082424702054:web:85bda4155ca7159e8d69a7"
};

const app = initializeApp(firebaseConfig); // Initialize Firebase
const db = getFirestore(app);// get a reference to the database

document.addEventListener('DOMContentLoaded', () => {
  getPeople()
  document.querySelector('.btnAddPerson').addEventListener('click', showOverlay);
  document.querySelector('.btnAddIdea').addEventListener('click', showOverlay);
  document.getElementById('btnSavePerson').addEventListener('click',savePerson);
  document.getElementById('btnConfirmDeletePerson').addEventListener('click',deletePerson);
  document.getElementById('btnConfirmDeleteIdea').addEventListener('click',deleteIdea);
  document.getElementById('btnConfirmEditPerson').addEventListener('click',editPerson);
  document.getElementById('btnConfirmEditIdea').addEventListener('click',editIdea);
  document.getElementById('btnSaveIdea').addEventListener('click',saveIdea)
  document.querySelectorAll('.btnCancel').forEach((button) => {
    button.addEventListener("click", (ev) => {
      hideOverlay(ev)
    })
  })
});

function hideOverlay(ev) {
  ev.preventDefault();
  document.querySelector('.overlay').classList.remove('active');
  document
  .querySelectorAll('.overlay dialog')
  .forEach((dialog) => dialog.classList.remove('active'));
}

function showOverlay(ev, giftId) {
  ev.preventDefault();
  document.querySelector('.overlay').classList.add('active');
  let button
  switch (ev.target.classList.value) {
    case 'btnAddPerson':
      button = 'dlgPerson'
      break;
    case 'btnEditPerson':
      button = 'dlgPersonEdit'
      break;
    case 'btnDeletePerson':
      button = 'dlgPersonDelete'
      break;
    case 'btnAddIdea':
      button = 'dlgIdea'
      break;
    case 'btnEditIdea':
      button = 'dlgIdeaEdit'
      break;
    case 'btnDeleteIdea':
      button = 'dlgIdeaDelete'
      break;
    default:
      console.log(`Button not exist`);
  }
  document.getElementById(button).classList.add('active');
}

function getPeople(){
  const peopleColRef = collection(db, 'people');
  onSnapshot(peopleColRef, (querySnapshot) => { // will run once initially and each time there is a change in data in the collection*
    let people = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data(); // to hold all teh document data not including the id
      const id = doc.id; //every `doc` object has a `id` property that holds the `_id` value from Firestore.
      people.push({id, ...data});
    });
    if (people.length != 0) {
      buildPeople(people);
      document.querySelector('.person').classList.add('selected')
      getIdeas(people[0].id)
      document.querySelectorAll('.person').forEach((person) => {
            person.addEventListener('click', (ev) => {
                selectPerson(ev)
            })
        });
      }
  })
}

function getIdeas(id){
  const personRef = doc(db, 'people', id);//get an actual reference to the person document 
  const docs = query( //then run a query where the `person-id` property matches the reference for the person
    collection(db, 'gift-ideas'),
    where('person-id', '==', personRef)
    );
  onSnapshot(docs, (querySnapshot) => {
    const gifts = []; //to hold all the gifts from the collection and to clear teh previous gifts
    querySnapshot.forEach((doc) => { 
      const data = doc.data();
      const id = doc.id;
      gifts.push({id, ...data});
    });
    buildGifts(gifts);
  })
}

function buildPeople(people){ 
  let ul = document.querySelector('ul.person-list'); //build the HTML
  ul.innerHTML = people.map(person=>{ //replace the old ul contents with the new.
    const dob = `${months[person['birth-month']-1]} ${person['birth-day']}`;//Use the number of the birth-month less 1 as the index for the months array
    return `<li data-id="${person.id}" class="person">
            <p class="name">${person.name}</p>
            <p class="dob">${dob}</p>
            <button class="btnEditPerson">Edit Person</button>
            <button class="btnDeletePerson">Delete Person</button>
          </li>`;
  }).join('');
  document.querySelectorAll('.btnEditPerson').forEach((button) => {
    button.addEventListener('click', showOverlay);
  })
  document.querySelectorAll('.btnDeletePerson').forEach((button) => {
    button.addEventListener('click', showOverlay);
  })
}

function buildGifts(gifts){
  let ul = document.querySelector('ul.idea-list');  //build the HTML
  if (gifts.length != 0) {   //replace the old ul contents with the new.
    ul.innerHTML = gifts.map(gift => {
      const ideaRef = doc(db, 'gift-ideas', gift.id)
      return `<li class="idea" data-id="${gift.id}">
      <label for="chk-uniqueid">
      <input type="checkbox" class="chk-uniqueid" data-id="${gift.id}" ${gift.bought==true?'checked':''}/> Bought</label>
      <p class="title">${gift.idea}</p>
      <p class="location">${gift.location}</p>
      <button class="btnEditIdea">Edit Idea</button>
      <button class="btnDeleteIdea" >Delete Idea</button>
      </li>`
    }).join('');
    document.querySelectorAll('.btnEditIdea').forEach((button) => {
      button.addEventListener('click', (ev) => {
        giftId = (ev.path[1].dataset.id)
        showOverlay(ev, giftId)
      });
    })
    document.querySelectorAll('.btnDeleteIdea').forEach((button) => {
      button.addEventListener('click', (ev) => {
        giftId = (ev.path[1].dataset.id)
        showOverlay(ev, giftId)
      });
    })
    let checkboxes = document.querySelectorAll(".chk-uniqueid");
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        const ideaRef = doc(db, 'gift-ideas', this.getAttribute("data-id"))
        updateDoc(ideaRef, {
        "bought": this.checked
        })
      });
    })
  } else ul.innerHTML = `<h3 class="no-idea">There are no ideas added! click on "Add Idea" button to add one</h3>`
}

function selectPerson (ev) {
  ev.path[1].classList.add("selected")
  document.querySelectorAll('.person').forEach((person) => {
    if (person != ev.path[1]) person.classList.remove("selected")
  });
  getIdeas(ev.path[1].dataset.id)
}

async function savePerson(ev){
  ev.preventDefault();
  let name = document.getElementById('name').value;
  let month = document.getElementById('month').value;
  let day = document.getElementById('day').value;
  if(!name || !month || !day) return; //form needs more info 
  const person = {
    name,
    'birth-month': month,
    'birth-day': day
  };
  try {
    const docRef = await addDoc(collection(db, 'people'), person );
    console.log('Document written with ID: ', docRef.id);
    person.id = docRef.id //0. add id to the person object
    document.getElementById('name').value = '';  //1. clear the form fields 
    document.getElementById('month').value = '';
    document.getElementById('day').value = '';
    hideOverlay(ev);//2. hide the dialog and the overlay
    tellUser(`${name} added to database`);// 3. display a message to the user about success 
  } catch (err) {
    console.error('Error adding document: ', err);
  }
}

async function saveIdea(ev){
  ev.preventDefault();
  let title = document.getElementById('title').value;
  let location = document.getElementById('location').value;
  if(!title || !location) return; //form needs more info 
  let personId = document.querySelector(".selected").getAttribute("data-id")
  const selectedPersonRef = doc(db, 'people', personId);
  const idea = {
    "idea": title,
    location,
    "person-id": selectedPersonRef,
    "bought": false
  };
  try {
    const docRef = await addDoc(collection(db, 'gift-ideas'), idea );
    console.log('Document written with ID: ', docRef.id);
    idea.id = docRef.id //0. add id to the idea object
    document.getElementById('title').value = ''; //1. clear the form fields 
    document.getElementById('location').value = '';
    hideOverlay(ev);  //2. hide the dialog and the overlay
    tellUser(`${title} added to database`);// 3. display a message to the user about success 
  } catch (err) {
    console.error('Error adding document: ', err);
  }
}

function deletePerson (ev) {
  const docRef = doc(db, 'people', document.querySelector(".selected").getAttribute("data-id"))
  deleteDoc(docRef)
  hideOverlay(ev)
}

function editPerson (ev) {
  const docRef = doc(db, 'people', document.querySelector(".selected").getAttribute("data-id"))
  updateDoc(docRef, {
    'name': document.getElementById('editName').value,
    'birth-month': document.getElementById('editMonth').value,
    'birth-day': document.getElementById('editDay').value
  }).then(() => {
    document.getElementById('editName').value = '';
    document.getElementById('editMonth').value = '';
    document.getElementById('editDay').value = '';
    hideOverlay(ev)
  })
}

function deleteIdea (ev) {
  const docRef = doc(db, 'gift-ideas', giftId)
  deleteDoc(docRef)
  hideOverlay(ev)
}

function editIdea (ev) {
  const docRef = doc(db, 'gift-ideas', giftId)
  updateDoc(docRef, {
    "idea" : document.getElementById('editTitle').value,
    "location" : document.getElementById('editLocation').value
  }).then(() => {
    document.getElementById('editTitle').value = '';
    document.getElementById('editLocation').value = '';
    hideOverlay(ev);
  })
}

function tellUser(msg) {
  let alert = document.createElement("div");
  alert.classList.add("message")
  alert.innerHTML = msg;
  setTimeout(() => {
    alert.parentNode.removeChild(alert);
  },2000);
  document.body.appendChild(alert);
}