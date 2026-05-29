import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import { db } from "../services/firebaseConfig";

export default function HomeScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // ⭐ Pull to Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Books
  const fetchBooks = async () => {
    try {
      const q = query(
        collection(db, "books"),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBooks(fetched);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // ⭐ Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };

  // --- Quick Action Buttons ---
  const QuickAction = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <Ionicons name={icon} size={28} color={theme.colors.primary} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
          onPress={() => navigation.navigate("MyLibrary")}
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
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginVertical: 20 }}
        />
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

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  welcomeSection: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: theme.isDarkMode ? "#1a3a52" : "#E3F2FD",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  welcomeTitle: { fontSize: 22, fontWeight: "bold", color: theme.isDarkMode ? "#64B5F6" : "#0D47A1" },
  welcomeSubtitle: { fontSize: 14, color: theme.colors.subText, marginTop: 4 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  actionCard: {
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 15,
    width: 100,
    elevation: 3,
  },
  actionText: { fontSize: 13, fontWeight: "600", color: theme.colors.text, marginTop: 5 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: theme.colors.text },
  viewAll: { color: theme.colors.primary, fontWeight: "600" },
  bookCard: {
    backgroundColor: theme.colors.card,
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
    backgroundColor: theme.colors.border,
  },
  bookTitle: { fontSize: 14, fontWeight: "bold", color: theme.colors.text },
  bookAuthor: { fontSize: 12, color: theme.colors.subText },
  infoBanner: {
    backgroundColor: theme.colors.primary,
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
    color: theme.colors.subText,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    color: theme.colors.subText,
    marginVertical: 20,
  },
});