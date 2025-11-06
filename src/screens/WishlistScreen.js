import React, { useEffect, useState, useContext } from "react";
import { View, FlatList, Text } from "react-native";
import { db } from "../services/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import BookCard from "../components/BookCard";

export default function WishlistScreen() {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const q = query(collection(db, "wishlist"), where("userId", "==", user?.uid));
      const snapshot = await getDocs(q);
      setWishlist(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchWishlist();
  }, [user]);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {wishlist.length === 0 ? (
        <Text>No items in wishlist.</Text>
      ) : (
        <FlatList data={wishlist} renderItem={({ item }) => <BookCard book={item} />} keyExtractor={(i) => i.id} />
      )}
    </View>
  );
}
