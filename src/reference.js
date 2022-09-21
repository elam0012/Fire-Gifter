import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where,
  orderBy, serverTimestamp,
  updateDoc
} from 'firebase/firestore'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoioJZ1MuYeu8WK9cMvw4XxykGjCK90hU",
  authDomain: "stupid-first-project-a60ad.firebaseapp.com",
  projectId: "stupid-first-project-a60ad",
  storageBucket: "stupid-first-project-a60ad.appspot.com",
  messagingSenderId: "744257806926",
  appId: "1:744257806926:web:b31770cc51f3c5154c191f"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// init services
const db = getFirestore()
// collection ref
const colRef = collection(db, 'books')
// queries
const q = query(colRef, where("author", "==", "patrick rothfuss"), orderBy('createdAt'))
// realtime collection data
onSnapshot(q, (snapshot) => {
  let books = []
  snapshot.docs.forEach(doc => {
    books.push({ ...doc.data(), id: doc.id })
  })
  console.log(books)
})
// adding docs
const addBookForm = document.querySelector('.add')
addBookForm.addEventListener('submit', (e) => {
  e.preventDefault()
  addDoc(colRef, {
    title: addBookForm.title.value,
    author: addBookForm.author.value,
    createdAt: serverTimestamp()
  })
  .then(() => {
    addBookForm.reset()
  })
})
// deleting docs
const deleteBookForm = document.querySelector('.delete')
deleteBookForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const docRef = doc(db, 'books', deleteBookForm.id.value)
  deleteDoc(docRef)
    .then(() => {
      deleteBookForm.reset()
    })
})
// fetching a single document (& realtime)
const docRef = doc(db, 'books', 'gGu4P9x0ZHK9SspA1d9j')
onSnapshot(docRef, (doc) => {
  console.log(doc.data(), doc.id)
})
// updating a document
const updateForm = document.querySelector('.update')
updateForm.addEventListener('submit', (e) => {
  e.preventDefault()
  let docRef = doc(db, 'books', updateForm.id.value)
  updateDoc(docRef, {
    title: 'updated title'
  })
  .then(() => {
    updateForm.reset()
  })
})