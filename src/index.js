import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, query, where, addDoc} from 'firebase/firestore';
let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const firebaseConfig = {
  apiKey: "AIzaSyDuzvlK2q939LGuhDXP2cLyxDqW81uQE9M",
  authDomain: "fire-giftr-134a8.firebaseapp.com",
  projectId: "fire-giftr-134a8",
  storageBucket: "fire-giftr-134a8.appspot.com",
  messagingSenderId: "1082424702054",
  appId: "1:1082424702054:web:85bda4155ca7159e8d69a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// get a reference to the database
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  getPeople()
  // document.getElementById('btnCancelPerson').addEventListener('click', hideOverlay);
  // document.getElementById('btnCancelIdea').addEventListener('click', hideOverlay);
  // document.querySelector('.overlay').addEventListener('click', hideOverlay);
  document.getElementById('btnAddPerson').addEventListener('click', showOverlay);
  document.getElementById('btnEditPerson').addEventListener('click', showOverlay);
  document.getElementById('btnDeletePerson').addEventListener('click', showOverlay);
  document.getElementById('btnAddIdea').addEventListener('click', showOverlay);
  document.getElementById('btnEditIdea').addEventListener('click', showOverlay);
  document.getElementById('btnDeleteIdea').addEventListener('click', showOverlay);
  document.getElementById('btnSavePerson').addEventListener('click',savePerson)
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

function showOverlay(ev) {
  ev.preventDefault();
  document.querySelector('.overlay').classList.add('active');
  // const id = ev.target.id === 'btnAddPerson' ? 'dlgPerson' : 'dlgIdea';
  console.log(ev.target.id)
  let id
  switch (ev.target.id) {
    case 'btnAddPerson':
      id = 'dlgPerson'
      break;

    case 'btnEditPerson':
      id = 'dlgPersonEdit'
      break;

    case 'btnDeletePerson':
      id = 'dlgPersonDelete'
      break;

    case 'btnAddIdea':
      id = 'dlgIdea'
      break;

    case 'btnEditIdea':
      id = 'dlgIdeaEdit'
      break;

    case 'btnDeleteIdea':
      id = 'dlgIdeaDelete'
      break;

    default:
      console.log(`Button not exist`);
}

console.log(id)

  //TODO: check that person is selected before adding an idea
  document.getElementById(id).classList.add('active');
}

const people = []; //to hold all the people from the collection

async function getPeople(){
  const querySnapshot = await getDocs(collection(db, 'people'));
  querySnapshot.forEach((doc) => {
    const data = doc.data(); // to hold all teh document data not including the id
    const id = doc.id; //every `doc` object has a `id` property that holds the `_id` value from Firestore.
    people.push({id, ...data});
  });
  buildPeople(people);
  document.querySelector('.person').classList.add('selected')
  getIdeas(people[0].id)
  document.querySelectorAll('.person').forEach((person) => {
        person.addEventListener('click', (ev) => {
            selectPerson(ev)
        })
    });
}

async function getIdeas(id){
  const gifts = []; //to hold all the gifts from the collection and to clear teh previous gifts
  //get an actual reference to the person document 
  const personRef = doc(db, 'people', id);
  //then run a query where the `person-id` property matches the reference for the person
  const docs = query(
    collection(db, 'gift-ideas'),
    where('person-id', '==', personRef)
  );
  const querySnapshot = await getDocs(docs);

  querySnapshot.forEach((doc) => { 
    const data = doc.data();
    const id = doc.id;
    gifts.push({id, ...data});
  });
  buildGifts(gifts);
}

function buildPeople(people){
  //build the HTML
  let ul = document.querySelector('ul.person-list');
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
  if (gifts.length != 0) {
    ul.innerHTML = gifts.map(gift => {
      return `<li class="idea" data-id="${gift.id}">
      <label for="chk-uniqueid"
      ><input type="checkbox" id="chk-uniqueid" /> Bought</label
      >
      <p class="title">${gift.idea}</p>
      <p class="location">${gift.location}</p>
      </li>`
    }).join('');
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
    //0. add id to the person object
    person.id = docRef.id
    //1. clear the form fields 
    document.getElementById('name').value = '';
    document.getElementById('month').value = '';
    document.getElementById('day').value = '';
    //2. hide the dialog and the overlay
    hideOverlay(ev);
    //3. display a message to the user about success 
    // tellUser(`Person ${name} added to database`);
    // person.id = docRef.id;
    //4. ADD the new HTML to the <ul> using the new object
    showPerson(person);
  } catch (err) {
    console.error('Error adding document: ', err);
    //do you want to stay on the dialog?
    //display a mesage to the user about the problem
  }
}

function showPerson(person){
  let li = document.getElementById(person.id);
  // let li = document.querySelector(`[data-id=${person.id}]`)
  if(li){
    //update on screen
    const dob = `${months[person['birth-month']-1]} ${person['birth-day']}`;
    //Use the number of the birth-month less 1 as the index for the months array
    //replace the existing li with this new HTML
    li.outerHTML = `<li data-id="${person.id}" class="person">
            <p class="name">${person.name}</p>
            <p class="dob">${dob}</p>
          </li>`;
  }else{
    //add to screen
    const dob = `${months[person['birth-month']-1]} ${person['birth-day']}`;
    //Use the number of the birth-month less 1 as the index for the months array
    li = `<li data-id="${person.id}" class="person">
            <p class="name">${person.name}</p>
            <p class="dob">${dob}</p>
          </li>`;
    document.querySelector('ul.person-list').innerHTML += li;
  }
  document.querySelectorAll('.person').forEach((person) => {
    person.classList.remove("selected")
  });
  
  document.querySelector(`[data-id=${person.id}]`).classList.add('selected')
  getIdeas(person.id)
  document.querySelectorAll('.person').forEach((person) => {
        person.addEventListener('click', (ev) => {
            selectPerson(ev)
        })
    });
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
    "person-id": selectedPersonRef
  };
  
  try {
    const docRef = await addDoc(collection(db, 'gift-ideas'), idea );
    console.log('Document written with ID: ', docRef.id);
    //0. add id to the idea object
    idea.id = docRef.id
    //1. clear the form fields 
    document.getElementById('title').value = '';
    document.getElementById('location').value = '';
    //2. hide the dialog and the overlay
    hideOverlay(ev);
    //3. display a message to the user about success 
    // tellUser(`Person ${name} added to database`);
    // person.id = docRef.id;
    //4. ADD the new HTML to the <ul> using the new object
    showIdea(idea);
  } catch (err) {
    console.error('Error adding document: ', err);
    //do you want to stay on the dialog?
    //display a mesage to the user about the problem
  }
}

function showIdea(idea){
  let li = document.getElementById(idea.id);
  // let li = document.querySelector(`[data-id=${person.id}]`)
  if(li){
    li.outerHTML = `<li class="idea" data-id="${idea.id}">
      <label for="chk-uniqueid">
      <input type="checkbox" id="chk-uniqueid" /> Bought</label>
      <p class="title">${idea.idea}</p>
      <p class="location">${idea.location}</p>
      </li>`
  }else{
    //add to screen
    document.querySelector(".no-idea").classList.add("hide")
    li = `<li class="idea" data-id="${idea.id}">
      <label for="chk-uniqueid">
      <input type="checkbox" id="chk-uniqueid" /> Bought</label>
      <p class="title">${idea.idea}</p>
      <p class="location">${idea.location}</p>
      </li>`
    document.querySelector('ul.idea-list').innerHTML += li;
  }

  document.querySelectorAll('.person').forEach((person) => {
        person.addEventListener('click', (ev) => {
            selectPerson(ev)
        })
    });
}