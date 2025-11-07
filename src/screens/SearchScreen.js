import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Header from "../components/Header";

export default function SearchScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);

  // 📥 Fetch all books once
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "books"));
        const allBooks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(allBooks);
        setFilteredBooks(allBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, []);

  // 🔍 Filter books when user types
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const results = books.filter(
      (book) =>
        book.title?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query)
    );
    setFilteredBooks(results);
  }, [searchQuery, books]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* ✅ Reusable Header */}
        <Header
          title="Search Books"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />

        {/* 🔎 Search Input */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search by title or author..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* 📚 Results */}
        {filteredBooks.length === 0 ? (
          <Text style={styles.noResult}>No books found</Text>
        ) : (
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("BookDetails", { book: item })
                } // optional, if BookDetailsScreen exists
              >
                <Image
                  source={{
                    uri:
                      item.image ||
                      "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
                  }}
                  style={styles.image}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.author}>by {item.author}</Text>
                  <Text style={styles.available}>
                    {item.isAvailable ? "✅ Available" : "❌ Rented"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  searchBar: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    margin: 12,
    backgroundColor: "#fff",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  image: {
    width: 70,
    height: 100,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  author: { color: "#666", marginTop: 2 },
  available: { fontSize: 12, color: "#2196F3", marginTop: 5 },
  noResult: { textAlign: "center", marginTop: 50, color: "#999" },
});
