// src/screens/SearchScreen.js
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    Keyboard,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import { db } from "../services/firebaseConfig";

export default function SearchScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // ⭐ Pull to Refresh
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchBooks();
  }, []);

  // ⭐ Pull to Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };

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
    <View style={styles.container}>
      <Header
        title="Search Books"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <TextInput
        style={styles.searchBar}
        placeholder="Search by title or author..."
        placeholderTextColor={theme.colors.subText}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus={true}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>

          {filteredBooks.length === 0 ? (
            <Text style={styles.noResult}>No books found</Text>
          ) : (
            <FlatList
              data={filteredBooks}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              } // ⭐ REFRESH ADDED HERE
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.getParent()?.navigate("BookDetails", { book: item })
                  }
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

                    {item.price && (
                      <Text style={styles.priceText}>₹{item.price}</Text>
                    )}

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
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  searchBar: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 10,
    margin: 12,
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
  },
  card: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
    backgroundColor: theme.colors.border,
  },
  title: { fontSize: 16, fontWeight: "bold", color: theme.colors.text },
  author: { color: theme.colors.subText, marginTop: 2 },
  available: { fontSize: 12, color: theme.colors.primary, marginTop: 5 },
  noResult: { textAlign: "center", marginTop: 50, color: theme.colors.subText },
  priceText: {
    fontWeight: "bold",
    color: theme.colors.primary,
    marginTop: 3,
  },
});
