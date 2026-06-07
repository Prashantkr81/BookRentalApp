// src/screens/MyLibraryScreen.js
import { Picker } from "@react-native-picker/picker";
import {
    collection,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
    Animated,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../services/firebaseConfig";

// -------------------- FADE-IN ANIMATION WRAPPER --------------------
const FadeIn = ({ children }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  return <Animated.View style={{ opacity: fadeAnim }}>{children}</Animated.View>;
};

// -------------------- READ-ONLY BOOK CARD --------------------
const BookCard = ({ book, history, theme, styles }) => {
  // Calculate rental duration
  let rentalDays = null;
  if (history && book.rentedAt && book.lastReturnedAt) {
    const start = new Date(book.rentedAt);
    const end = new Date(book.lastReturnedAt);
    rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  return (
    <FadeIn>
      <View style={styles.card}>
        <Image
          source={{
            uri:
              book.image ||
              "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
          }}
          style={styles.bookImg}
        />

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>by {book.author}</Text>

          {history ? (
            <>
              <Text style={styles.historyText}>
                Returned: {new Date(book.lastReturnedAt).toLocaleDateString()}
              </Text>
              {/* <Text style={styles.durationText}>
                Duration: {rentalDays} days
              </Text> */}
            </>
          ) : (
            <Text style={styles.statusText}>
              {book.isAvailable ? "Available" : "Currently Rented"}
            </Text>
          )}
        </View>
      </View>
    </FadeIn>
  );
};

// -------------------- MAIN SCREEN --------------------
export default function MyLibraryScreen({ navigation }) {
  const user = auth.currentUser;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [index, setIndex] = useState(0);
  const [sort, setSort] = useState("date");

  const [routes] = useState([
    { key: "mybooks", title: "My Books" },
    { key: "rented", title: "Rented" },
    { key: "history", title: "History" },
  ]);

  const [myBooks, setMyBooks] = useState([]);
  const [rentedBooks, setRentedBooks] = useState([]);
  const [historyBooks, setHistoryBooks] = useState([]);

  useEffect(() => {
    if (!user) return;

    // My Books
    onSnapshot(
      query(collection(db, "books"), where("ownerId", "==", user.uid)),
      (snap) => {
        setMyBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    // Currently Rented
    onSnapshot(
      query(
        collection(db, "books"),
        where("rentedBy", "==", user.uid),
        where("isAvailable", "==", false)
      ),
      (snap) => {
        setRentedBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    // History
    onSnapshot(
      query(collection(db, "books"), where("isAvailable", "==", true)),
      (snap) => {
        const filtered = snap
          .docs.map((d) => ({ id: d.id, ...d.data() }))
          .filter((b) => b.lastReturnedAt && b.rentedBy === null);

        setHistoryBooks(filtered);
      }
    );
  }, []);

  // --- Sorting Logic ---
  const sortBooks = (books) => {
    if (sort === "title") {
      return [...books].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }
    return [...books].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // --- EMPTY STATE ---
  const EmptyState = ({ text }) => (
    <View style={styles.emptyContainer}>
      <Image
        source={{
          uri: "https://cdn-icons-png.flaticon.com/512/4076/4076504.png",
        }}
        style={styles.emptyImg}
      />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );

  // --- RENDER EACH TAB ---
  const renderMyBooks = () =>
    myBooks.length === 0 ? (
      <EmptyState text="You have not added any books yet." />
    ) : (
      <FlatList
        data={sortBooks(myBooks)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} theme={theme} styles={styles} />}
      />
    );

  const renderRentedBooks = () =>
    rentedBooks.length === 0 ? (
      <EmptyState text="You are not renting any books currently." />
    ) : (
      <FlatList
        data={sortBooks(rentedBooks)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} theme={theme} styles={styles} />}
      />
    );

  const renderHistory = () =>
    historyBooks.length === 0 ? (
      <EmptyState text="No rental history found." />
    ) : (
      <FlatList
        data={sortBooks(historyBooks)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} history theme={theme} styles={styles} />}
      />
    );

  const renderScene = SceneMap({
    mybooks: renderMyBooks,
    rented: renderRentedBooks,
    history: renderHistory,
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title="My Library"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* SORT DROPDOWN */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <Picker
          selectedValue={sort}
          onValueChange={(value) => setSort(value)}
          style={styles.picker}
        >
          <Picker.Item label="Date" value="date" />
          <Picker.Item label="Title" value="title" />
        </Picker>
      </View>

      <TabView
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: theme.colors.primary }}
            style={{ backgroundColor: theme.colors.card, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border }}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.subText}
          />
        )}
      />
    </View>
  );
}

// -------------------- STYLES --------------------
const createStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    flexDirection: "row",
    borderRadius: 12,
    margin: 10,
    padding: 10,
    elevation: 2,
  },
  bookImg: {
    width: 90,
    height: 130,
    borderRadius: 8,
    backgroundColor: theme.colors.border,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
    color: theme.colors.text,
  },
  bookAuthor: {
    fontSize: 14,
    color: theme.colors.subText,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  historyText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  durationText: {
    fontSize: 13,
    color: theme.colors.subText,
    marginTop: 4,
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyImg: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.subText,
    textAlign: "center",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 15,
    backgroundColor: theme.colors.card,
  },
  sortLabel: {
    fontSize: 15,
    fontWeight: "bold",
    marginRight: 10,
    color: theme.colors.text,
  },
  picker: {
    flex: 1,
    color: theme.colors.text,
  },
});
