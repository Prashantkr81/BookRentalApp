import { addDoc, collection } from "firebase/firestore";
import { useMemo } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import placeholder from "../../assets/images/book_placeholder.jpg";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../services/firebaseConfig";

export default function BookCard({ book }) {
  const user = auth.currentUser;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to add books to your cart.");
      return;
    }

    try {
      // Add to user's cart in Firestore
      await addDoc(collection(db, "cart"), {
        userId: user.uid,
        bookId: book.id,
        title: book.title,
        author: book.author,
        image: book.image || null,
        addedAt: new Date().toISOString(),
      });

      Alert.alert("✅ Added to Cart", `"${book.title}" has been added to your cart.`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("❌ Error", "Could not add book to cart.");
    }
  };

  return (
    <View style={styles.card}>
      <Image
        source={book.image ? { uri: book.image } : placeholder}
        style={styles.image}
      />
      <View style={{ paddingHorizontal: 6 }}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>by {book.author}</Text>

        {/* ✅ Add to Cart Button */}
        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Text style={styles.cartText}>🛒 Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginVertical: 10,
    padding: 10,
    elevation: 3,
    width: "94%",
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.border,
  },
  title: { fontSize: 18, fontWeight: "bold", color: theme.colors.text },
  author: { fontSize: 14, color: theme.colors.subText, marginBottom: 12 },
  cartButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cartText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
