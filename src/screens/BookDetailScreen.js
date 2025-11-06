import React from "react";
import { View, Text, Image, Button } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";

export default function BookDetailScreen({ route }) {
  const { book } = route.params;

  const rentBook = async () => {
    try {
      await updateDoc(doc(db, "books", book.id), { isAvailable: false });
      alert("Book rented successfully!");
    } catch (error) {
      alert("Error renting book: " + error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Image source={{ uri: book.image }} style={{ width: "100%", height: 250, borderRadius: 10 }} />
      <Text style={{ fontSize: 24, fontWeight: "bold", marginVertical: 10 }}>{book.title}</Text>
      <Text style={{ color: "gray", marginBottom: 20 }}>by {book.author}</Text>
      <Text style={{ marginBottom: 20 }}>{book.description || "No description available."}</Text>
      <Button title={book.isAvailable ? "Rent Now" : "Currently Unavailable"} onPress={rentBook} disabled={!book.isAvailable} />
    </View>
  );
}
