import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { AuthContext } from "../context/AuthContext";
import BookCard from "../components/BookCard";

export default function MyRentalsScreen() {
  const { user } = useContext(AuthContext);
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    const fetchRentals = async () => {
      const q = query(collection(db, "books"), where("rentedBy", "==", user?.uid));
      const snapshot = await getDocs(q);
      setRentals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchRentals();
  }, [user]);

  return (
    <View style={{ padding: 10, flex: 1 }}>
      {rentals.length === 0 ? (
        <Text>No rented books yet.</Text>
      ) : (
        <FlatList data={rentals} renderItem={({ item }) => <BookCard book={item} />} keyExtractor={(i) => i.id} />
      )}
    </View>
  );
}
