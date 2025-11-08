// src/screens/CartScreen.js
import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { CartContext } from "../context/CartContext";
import Header from "../components/Header";

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  // 🧮 Calculate total price
  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  // 🧾 Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Your cart is empty", "Add books to your cart first!");
      return;
    }

    // ✅ Navigate to CheckoutScreen and pass cart data
    navigation.navigate("Checkout", { cart });
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image
        source={{
          uri:
            item.image ||
            "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
        }}
        style={styles.image}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>by {item.author}</Text>
        <Text style={styles.price}>₹{item.price || 0}</Text>
      </View>

      <TouchableOpacity
        onPress={() => removeFromCart(item.id)}
        style={styles.removeButton}
      >
        <Text style={styles.removeText}>✖</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="My Cart"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightIcon={cart.length > 0 ? "trash-outline" : null}
        onRightPress={() => {
          if (cart.length > 0) {
            Alert.alert("Clear Cart", "Are you sure you want to remove all books?", [
              { text: "Cancel", style: "cancel" },
              { text: "Yes", onPress: clearCart },
            ]);
          }
        }}
      />

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🛒 Your cart is empty</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={styles.browseButton}
          >
            <Text style={styles.browseText}>Browse Books</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10 }}
          />

          {/* 💰 Total + Proceed */}
          <View style={styles.summary}>
            <Text style={styles.totalText}>Total: ₹{total}</Text>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleProceedToCheckout}
            >
              <Text style={styles.checkoutText}>
                Proceed to Rent ({cart.length})
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    elevation: 2,
  },
  image: { width: 70, height: 100, borderRadius: 6, marginRight: 10 },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  author: { fontSize: 14, color: "#666" },
  price: { color: "#2196F3", fontWeight: "bold", marginTop: 4 },
  removeButton: {
    backgroundColor: "#f44336",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  removeText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, color: "#999", marginBottom: 20 },
  browseButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseText: { color: "#fff", fontWeight: "bold" },
  summary: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 0.5,
    borderColor: "#ddd",
  },
  totalText: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10 },
  checkoutButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
