import React, { useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import BookCard from "../components/BookCard";

export default function HomeScreen() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const snapshot = await getDocs(collection(db, "books"));
      setBooks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchBooks();
  }, []);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={books}
        renderItem={({ item }) => <BookCard book={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
