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
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen({ navigation }) {
  const [listedBooks, setListedBooks] = useState([]);
  const [rentedBooks, setRentedBooks] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // 🔹 NEW STATE
  const { setUser } = useContext(AuthContext);
  const user = auth.currentUser;

  // 🔹 Fetch data (moved into a function for reuse)
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      if (!refreshing) setLoading(true);

      // Get user name
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserName(userSnap.data().name || user.displayName || "Anonymous");
      } else {
        setUserName(user.displayName || "User");
      }

      // Fetch listed books
      const listedQuery = query(
        collection(db, "books"),
        where("ownerId", "==", user.uid)
      );
      const listedSnapshot = await getDocs(listedQuery);
      const listed = listedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch rented books
      const rentedQuery = query(
        collection(db, "books"),
        where("rentedBy", "==", user.uid)
      );
      const rentedSnapshot = await getDocs(rentedQuery);
      const rented = rentedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setListedBooks(listed);
      setRentedBooks(rented);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false); // ✅ stop refreshing
    }
  }, [user, refreshing]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData, processing]);

  // ✅ Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, [fetchUserData]);

  // ✅ Owner marks a book as returned
  const handleMarkReturned = async (book) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Login Required", "Please log in again.");
        return;
      }

      const bookRef = doc(db, "books", book.id);
      const bookSnap = await getDoc(bookRef);

      if (!bookSnap.exists()) {
        Alert.alert("❌ Error", "Book not found in database.");
        return;
      }

      const bookData = bookSnap.data();

      if (bookData.ownerId !== currentUser.uid) {
        Alert.alert("⚠️ Permission Denied", "Only the owner can mark this book as returned.");
        return;
      }

      if (bookData.isAvailable && !bookData.rentedBy) {
        Alert.alert("ℹ️ Info", "This book is already available.");
        return;
      }

      setProcessing(book.id);

      await updateDoc(bookRef, {
        isAvailable: true,
        rentedBy: null,
        rentedAt: null,
        lastReturnedAt: new Date().toISOString(),
      });

      Alert.alert("✅ Success", `"${book.title}" is now available again.`);
      setProcessing(null);
    } catch (error) {
      console.error("Error marking returned:", error);
      Alert.alert("❌ Error", error.message || "Failed to mark as returned.");
      setProcessing(null);
    }
  };

  // ✅ Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      Alert.alert("Logged Out", "You have been logged out successfully.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // ✅ ADDED
      }
    >
      <Header
        title="My Profile"
        rightIcon="notifications-outline"
        onRightPress={() => console.log("Notifications pressed")}
      />

      {/* 👤 User Info */}
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

      {/* 📚 Books Listed by User */}
      <Text style={styles.sectionTitle}>📚 Books You Listed</Text>
      {listedBooks.length === 0 ? (
        <Text style={styles.emptyText}>You haven’t listed any books yet.</Text>
      ) : (
        <FlatList
          data={listedBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.thumbnail} />
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>by {item.author}</Text>
              <Text
                style={{
                  color: item.isAvailable ? "#4CAF50" : "#F44336",
                  fontWeight: "bold",
                  marginBottom: 6,
                }}
              >
                {item.isAvailable ? "Available" : "Rented"}
              </Text>

              {!item.isAvailable && (
                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => handleMarkReturned(item)}
                  disabled={processing === item.id}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {processing === item.id ? "Processing..." : "Mark Returned"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* 📖 Books Rented by User */}
      <Text style={styles.sectionTitle}>📖 Books You Rented</Text>
      {rentedBooks.length === 0 ? (
        <Text style={styles.emptyText}>You haven’t rented any books yet.</Text>
      ) : (
        <FlatList
          data={rentedBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
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

      {/* 🚪 Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", marginVertical: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "bold", color: "#333" },
  email: { fontSize: 14, color: "#666", marginBottom: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#2196F3",
  },
  emptyText: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 10,
    padding: 10,
    width: 160,
    alignItems: "center",
    elevation: 2,
  },
  thumbnail: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  bookTitle: { fontSize: 14, fontWeight: "bold", textAlign: "center", color: "#333" },
  bookAuthor: { fontSize: 12, color: "#666", textAlign: "center", marginBottom: 6 },
  returnButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 6,
  },
  logoutButton: {
    backgroundColor: "#F44336",
    marginTop: 25,
    marginBottom: 40,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
