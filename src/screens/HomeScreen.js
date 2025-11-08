import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Header from "../components/Header";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const q = query(collection(db, "books"), orderBy("createdAt", "desc"), limit(10));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBooks(fetched);
      } catch (error) {
        console.error("Error loading books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // --- Quick Action Buttons ---
  const QuickAction = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <Ionicons name={icon} size={28} color="#2196F3" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🔷 Custom Header */}
      <Header
        title="BookHive 📚"
        rightIcon="notifications-outline"
        onRightPress={() => navigation.navigate("Notification")}
      />

      {/* 🧭 Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome to BookHive</Text>
        <Text style={styles.welcomeSubtitle}>
          Rent, share, and discover your favorite books instantly.
        </Text>
      </View>

      {/* ⚡ Quick Actions */}
      <View style={styles.actionRow}>
        <QuickAction
          icon="add-circle-outline"
          label="Add Book"
          onPress={() => navigation.navigate("Add Book")}
        />
        <QuickAction
          icon="library-outline"
          label="My Library"
          onPress={() => navigation.navigate("My Rentals")}
        />
        <QuickAction
          icon="search-outline"
          label="Search Books"
          onPress={() => navigation.navigate("Search")}
        />
      </View>

      {/* 🌟 Featured Books Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🌟 Featured Books</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 20 }} />
      ) : books.length === 0 ? (
        <Text style={styles.emptyText}>No books available right now.</Text>
      ) : (
        <FlatList
          data={books}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookCard}
              onPress={() => navigation.navigate("BookDetails", { book: item })}
            >
              <Image
                source={{
                  uri:
                    item.image ||
                    "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
                }}
                style={styles.bookImage}
              />
              <Text style={styles.bookTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>
                by {item.author}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 💬 Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={22} color="#fff" />
        <Text style={styles.infoText}>
          Did you know? You can also lend your books and earn credits!
        </Text>
      </View>

      {/* 🧾 Footer */}
      <Text style={styles.footer}>© 2025 BookHive - Empowering Readers</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  welcomeSection: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#E3F2FD",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  welcomeTitle: { fontSize: 22, fontWeight: "bold", color: "#0D47A1" },
  welcomeSubtitle: { fontSize: 14, color: "#555", marginTop: 4 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  actionCard: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 15,
    width: 100,
    elevation: 3,
  },
  actionText: { fontSize: 13, fontWeight: "600", color: "#333", marginTop: 5 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  viewAll: { color: "#2196F3", fontWeight: "600" },
  bookCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 12,
    padding: 10,
    width: 140,
    elevation: 3,
  },
  bookImage: {
    width: "100%",
    height: 170,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  bookTitle: { fontSize: 14, fontWeight: "bold", color: "#333" },
  bookAuthor: { fontSize: 12, color: "#777" },
  infoBanner: {
    backgroundColor: "#2196F3",
    margin: 15,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: { color: "#fff", fontSize: 14, flex: 1 },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    color: "#999",
    marginVertical: 20,
  },
});
