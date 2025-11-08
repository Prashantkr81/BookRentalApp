// src/screens/BookDetailScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db, auth } from "../services/firebaseConfig";
import { CartContext } from "../context/CartContext";
import Header from "../components/Header";

export default function BookDetailScreen({ route, navigation }) {
  const { book } = route.params;
  const { addToCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  // 🛒 Add book to cart
  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to add books to your cart.");
      return;
    }

    try {
      // Add to Firestore
      await addDoc(collection(db, "cart"), {
        userId: user.uid,
        bookId: book.id,
        title: book.title,
        author: book.author,
        image: book.image || null,
        price: book.price || 0,
        addedAt: new Date().toISOString(),
      });

      // Update local context
      addToCart(book);

      Alert.alert("✅ Added to Cart", `"${book.title}" has been added to your cart.`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("❌ Error", "Could not add book to cart.");
    }
  };

  // 🟢 Rent Now → Direct Checkout
  const handleRentBook = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to rent a book.");
      return;
    }

    if (!book.isAvailable) {
      Alert.alert("❌ Unavailable", "This book is currently rented.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Update Firestore: mark book as rented
      const bookRef = doc(db, "books", book.id);
      await updateDoc(bookRef, {
        isAvailable: false,
        rentedBy: user.uid,
        rentedAt: new Date().toISOString(),
      });

      // ✅ Add to rental history (optional)
      await addDoc(collection(db, "rentals"), {
        userId: user.uid,
        bookId: book.id,
        title: book.title,
        author: book.author,
        image: book.image || null,
        price: book.price || 0,
        rentedAt: new Date().toISOString(),
        status: "rented",
      });

      // ✅ Navigate to Checkout screen directly
      navigation.navigate("Checkout", {
        cart: [book], // pass as array (Checkout expects array)
        singleBook: true, // mark single-book checkout
      });
    } catch (error) {
      console.error("Error renting book:", error);
      Alert.alert("❌ Error", "Failed to rent book. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Header title="Book Details" showBack={true} onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* 📘 Thumbnail beside title */}
        <View style={styles.headerRow}>
          <Image
            source={{
              uri: book.image || "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
            }}
            style={styles.avatarThumb}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>by {book.author}</Text>
          </View>
        </View>

        {/* 🖼️ Large Book Cover */}
        <Image
          source={{
            uri: book.image || "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* 📑 Description */}
        <Text style={styles.description}>
          {book.description || "No description available for this book."}
        </Text>

        {/* 💰 Price & Availability */}
        <View style={styles.infoBox}>
          <Text style={styles.priceText}>💰 Price: ₹{book.price || 0}</Text>
          <Text
            style={[
              styles.availability,
              { color: book.isAvailable ? "#4CAF50" : "#F44336" },
            ]}
          >
            {book.isAvailable ? "✅ Available" : "❌ Currently Rented"}
          </Text>
        </View>

        {/* 🛒 Add to Cart */}
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Text style={styles.cartText}>🛒 Add to Cart</Text>
        </TouchableOpacity>

        {/* 🟢 Rent Now */}
        <TouchableOpacity
          style={[
            styles.rentButton,
            !book.isAvailable && { backgroundColor: "#aaa" },
          ]}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarThumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eee",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  author: { fontSize: 15, color: "#666", marginBottom: 5 },
  description: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  infoBox: { marginBottom: 25, alignItems: "center" },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 5,
  },
  availability: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  cartButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  cartText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  rentButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  rentText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
