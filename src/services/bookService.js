import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

const booksRef = collection(db, "books");

export const addBook = async (book) => await addDoc(booksRef, book);

export const getAllBooks = async () => {
  const snapshot = await getDocs(booksRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getBooksByUser = async (uid) => {
  const q = query(booksRef, where("rentedBy", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateBookStatus = async (id, data) => {
  const bookRef = doc(db, "books", id);
  await updateDoc(bookRef, data);
};
