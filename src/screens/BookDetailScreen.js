import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db, auth } from "../services/firebaseConfig";
import Header from "../components/Header";

export default function BookDetailScreen({ route, navigation }) {
  const { book } = route.params;
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const handleRentBook = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to rent a book.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Update book availability
      const bookRef = doc(db, "books", book.id);
      await updateDoc(bookRef, {
        isAvailable: false,
        rentedBy: user.uid,
        rentedAt: new Date().toISOString(),
      });

      // ✅ Add to rental history
      await addDoc(collection(db, "rentals"), {
        userId: user.uid,
        bookId: book.id,
        title: book.title,
        author: book.author,
        image: book.image || null,
        rentedAt: new Date().toISOString(),
        status: "rented",
      });

      Alert.alert("✅ Success", `"${book.title}" has been rented successfully!`);
      navigation.goBack();
    } catch (error) {
      console.error("Error renting book:", error);
      Alert.alert("❌ Error", "Failed to rent book. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* ✅ Header */}
      <Header title="Book Details" showBack={true} onBackPress={() => navigation.goBack()} />

      <View style={styles.container}>
        {/* 🖼️ Book Image */}
        <Image
          source={{ uri: book.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* 📘 Book Info */}
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>by {book.author}</Text>

        <Text style={styles.description}>
          {book.description || "No description available for this book."}
        </Text>

        <Text style={styles.availability}>
          {book.isAvailable ? "✅ Available to rent" : "❌ Currently rented"}
        </Text>

        {/* 🟢 Rent Button */}
        <TouchableOpacity
          style={[styles.rentButton, !book.isAvailable && { backgroundColor: "#aaa" }]}
          onPress={handleRentBook}
          disabled={!book.isAvailable || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.rentText}>
              {book.isAvailable ? "Rent Now" : "Unavailable"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", color: "#333" },
  author: { fontSize: 16, color: "#666", marginBottom: 15 },
  description: { fontSize: 15, color: "#555", textAlign: "center", marginBottom: 20 },
  availability: { fontSize: 16, fontWeight: "bold", color: "#2196F3", marginBottom: 25 },
  rentButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  rentText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
