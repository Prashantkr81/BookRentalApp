import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function ProfileScreen({ navigation }) {
  const [listedBooks, setListedBooks] = useState([]);
  const [rentedBooks, setRentedBooks] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const { setUser } = useContext(AuthContext);
  const user = auth.currentUser;

  // ----------------------------------------------------------------------------
  // FETCH PROFILE DATA
  // ----------------------------------------------------------------------------
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      if (!refreshing) setLoading(true);

      // USER NAME
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      setUserName(
        userSnap.exists()
          ? userSnap.data().name || user.displayName || "Anonymous"
          : user.displayName || "User"
      );

      // LISTED BOOKS
      const listedQuery = query(
        collection(db, "books"),
        where("ownerId", "==", user.uid)
      );

      const listedSnapshot = await getDocs(listedQuery);
      setListedBooks(
        listedSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );

      // RENTED BOOKS
      const rentedQuery = query(
        collection(db, "books"),
        where("rentedBy", "==", user.uid)
      );

      const rentedSnapshot = await getDocs(rentedQuery);
      setRentedBooks(
        rentedSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // ----------------------------------------------------------------------------
  // REFRESH CONTROL
  // ----------------------------------------------------------------------------
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  // ----------------------------------------------------------------------------
  // MARK RETURNED
  // ----------------------------------------------------------------------------
  const handleMarkReturned = async (book) => {
    try {
      const bookRef = doc(db, "books", book.id);

      await updateDoc(bookRef, {
        isAvailable: true,
        rentedBy: null,
        rentedAt: null,
        lastReturnedAt: new Date().toISOString(),
      });

      Alert.alert("Success", `"${book.title}" is now available.`);
      fetchUserData();
    } catch (error) {
      console.error("Return error:", error);
    }
  };

  // ----------------------------------------------------------------------------
  // DELETE BOOK
  // ----------------------------------------------------------------------------
  const handleDeleteBook = async (bookId) => 
    {
    Alert.alert("Delete Book?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "books", bookId));
            Alert.alert("Deleted", "Book removed successfully.");
            fetchUserData();
          } catch (error) {
            console.error("Delete error:", error);
            Alert.alert("Error", "Failed to delete book.");
          }
        },
      },
    ]);
  };

  // ----------------------------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------------------------
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  // ----------------------------------------------------------------------------
  // LOADING SCREEN
  // ----------------------------------------------------------------------------
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  // ----------------------------------------------------------------------------
  // UI
  // ----------------------------------------------------------------------------
  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Header title="My Profile" />

      {/* USER PROFILE */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              user.photoURL ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* LISTED BOOKS HEADER */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📚 Books You Listed</Text>

        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <Text style={styles.editToggle}>{editMode ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      {/* LISTED BOOKS */}
      {listedBooks.length === 0 ? (
        <Text style={styles.emptyText}>You haven’t listed any books yet.</Text>
      ) : (
        <FlatList
          data={listedBooks}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={styles.card}
              onStartShouldSetResponder={() => true}
            >
              <Image source={{ uri: item.image }} style={styles.thumbnail} />

              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>by {item.author}</Text>

              <Text
                style={{
                  color: item.isAvailable ? "#4CAF50" : "#F44336",
                  fontWeight: "bold",
                }}
              >
                {item.isAvailable ? "Available" : "Rented"}
              </Text>

              {/* EDIT + DELETE only in edit mode */}
              {editMode && (
                <>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      navigation.navigate("EditBookScreen", { book: item })
                    }
                  >
                    <Icon name="edit" size={20} color="#fff" />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                  disabled={!item.isAvailable}   // 👈 DISABLE PRESS
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: item.isAvailable ? "#D9534F" : "#BDBDBD", // 👈 GREY OUT
                      opacity: item.isAvailable ? 1 : 0.5, // 👈 DIM EFFECT
                    },
                  ]}
                  onPress={() => {
                    if (!item.isAvailable) {
                      Alert.alert("Cannot Delete", "Currently rented, cannot be deleted.");
                      return;
                    }
                    handleDeleteBook(item.id);
                  }}
                >
                  <Icon
                    name="delete"
                    size={20}
                    color={item.isAvailable ? "#fff" : "#757575"} // 👈 GREY ICON
                  />
                  <Text
                    style={[
                      styles.actionText,
                      { color: item.isAvailable ? "#fff" : "#757575" }, // 👈 GREY TEXT
                    ]}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
                </>
              )}

              {/* RETURN BUTTON */}
              {!item.isAvailable && !editMode && (
                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => handleMarkReturned(item)}
                >
                  <Text style={{ color: "#fff" }}>Mark Returned</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* RENTED BOOKS */}
      <Text style={styles.sectionTitle}>📖 Books You Rented</Text>

      {rentedBooks.length === 0 ? (
        <Text style={styles.emptyText}>You haven’t rented any books yet.</Text>
      ) : (
        <FlatList
          data={rentedBooks}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.thumbnail} />
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>by {item.author}</Text>
              <Text style={{ color: "#F44336", fontWeight: "bold" }}>Rented</Text>
            </View>
          )}
        />
      )}

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ----------------------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { alignItems: "center", marginVertical: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  name: { fontSize: 20, fontWeight: "bold", color: "#333" },
  email: { color: "#666", marginTop: 4 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    alignItems: "center",
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
    marginLeft: 10,
  },
  editToggle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
    paddingRight: 10,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#777",
    marginVertical: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    width: 160,
    alignItems: "center",
    margin: 10,
    elevation: 3,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginBottom: 6,
  },

  bookTitle: { fontWeight: "bold", fontSize: 14, textAlign: "center" },
  bookAuthor: { fontSize: 12, color: "#666", marginBottom: 5 },

  actionButton: {
    flexDirection: "row",
    backgroundColor: "#2196F3",
    padding: 6,
    borderRadius: 6,
    width: "100%",
    justifyContent: "center",
    marginVertical: 4,
  },
  actionText: { color: "#fff", marginLeft: 6, fontWeight: "bold" },

  returnButton: {
    backgroundColor: "#4CAF50",
    padding: 6,
    borderRadius: 6,
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },

  logoutButton: {
    backgroundColor: "#000000ff",
    paddingVertical: 12,
    margin: 30,
    // marginInline: 650,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
