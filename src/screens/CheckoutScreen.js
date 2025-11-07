import React, { useContext } from "react";
import { View, Text, FlatList, Button, StyleSheet, Alert } from "react-native";
import { updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebaseConfig";
import { CartContext } from "../context/CartContext";

export default function CheckoutScreen({ route, navigation }) {
  const { cart } = route.params;
  const { clearCart } = useContext(CartContext);

  const handleConfirmCheckout = async () => {
    try {
      for (let book of cart) {
        await updateDoc(doc(db, "books", book.id), {
          isAvailable: false,
          rentedBy: auth.currentUser?.uid,
        });
      }
      clearCart();
      Alert.alert("✅ Checkout Successful!", "Books have been rented.");
      navigation.navigate("Profile"); // Go to profile to view rented books
    } catch (error) {
      console.error("Checkout error:", error);
      Alert.alert("❌ Failed to checkout", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Checkout</Text>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.title}</Text>
          </View>
        )}
      />
      <Button title="Confirm Rental" onPress={handleConfirmCheckout} color="#2196F3" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  item: { backgroundColor: "#fff", padding: 10, marginBottom: 5, borderRadius: 5 },
  text: { fontSize: 16 },
});
