import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, ScrollView } from "react-native";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";
import Header from "../components/Header";


export default function ProfileScreen() {
  const [listedBooks, setListedBooks] = useState([]);
  const [rentedBooks, setRentedBooks] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        // 🔹 1. Try getting name from Firestore (users collection)
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserName(userSnap.data().name || user.displayName || "Anonymous");
        } else {
          // fallback if no Firestore record
          setUserName(user.displayName || "User");
        }

        // 🔹 2. Fetch listed books (uploaded by user)
        const listedQuery = query(
          collection(db, "books"),
          where("ownerId", "==", user.uid)
        );
        const listedSnapshot = await getDocs(listedQuery);
        const listed = listedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔹 3. Fetch rented books
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
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ✅ Header used here */}
      <Header
        title="My Profile"
        rightIcon="notifications-outline"
        onRightPress={() => console.log("Notifications Pressed")}
      />
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

      {/* Listed Books Section */}
      <Text style={styles.sectionTitle}>📚 Your Listed Books</Text>
      {listedBooks.length === 0 ? (
        <Text style={styles.emptyText}>You haven't listed any books yet.</Text>
      ) : (
        <FlatList
          data={listedBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>by {item.author}</Text>
            </View>
          )}
        />
      )}

      {/* Rented Books Section */}
      <Text style={styles.sectionTitle}>📖 Books You Rented</Text>
      {rentedBooks.length === 0 ? (
        <Text style={styles.emptyText}>You haven't rented any books yet.</Text>
      ) : (
        <FlatList
          data={rentedBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>by {item.author}</Text>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", marginVertical: 20 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: { fontSize: 20, fontWeight: "bold", color: "#333" },
  email: { fontSize: 14, color: "#666", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, color: "#2196F3" },
  emptyText: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 10,
    padding: 10,
    width: 150,
    alignItems: "center",
    elevation: 2,
  },
  image: { width: 100, height: 140, borderRadius: 5, marginBottom: 8 },
  bookTitle: { fontSize: 14, fontWeight: "bold", textAlign: "center" },
  bookAuthor: { fontSize: 12, color: "#666", textAlign: "center" },
});
