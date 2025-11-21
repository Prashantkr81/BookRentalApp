// src/screens/MyLibraryScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../services/firebaseConfig";
import Header from "../components/Header";

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
const BookCard = ({ book, history }) => {
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
        renderItem={({ item }) => <BookCard book={item} />}
      />
    );

  const renderRentedBooks = () =>
    rentedBooks.length === 0 ? (
      <EmptyState text="You are not renting any books currently." />
    ) : (
      <FlatList
        data={sortBooks(rentedBooks)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} />}
      />
    );

  const renderHistory = () =>
    historyBooks.length === 0 ? (
      <EmptyState text="No rental history found." />
    ) : (
      <FlatList
        data={sortBooks(historyBooks)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} history />}
      />
    );

  const renderScene = SceneMap({
    mybooks: renderMyBooks,
    rented: renderRentedBooks,
    history: renderHistory,
  });

  return (
    <View style={{ flex: 1 }}>
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
            indicatorStyle={{ backgroundColor: "#2196F3" }}
            style={{ backgroundColor: "#fff" }}
            activeColor="#2196F3"
            inactiveColor="#777"
          />
        )}
      />
    </View>
  );
}

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
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
    backgroundColor: "#eee",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2196F3",
  },
  historyText: {
    fontSize: 14,
    color: "#444",
  },
  durationText: {
    fontSize: 13,
    color: "#666",
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
    color: "#777",
    textAlign: "center",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 15,
  },
  sortLabel: {
    fontSize: 15,
    fontWeight: "bold",
    marginRight: 10,
  },
  picker: {
    flex: 1,
  },
});
