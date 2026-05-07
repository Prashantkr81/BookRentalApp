// src/screens/BookDetailScreen.js
import {
    addDoc,
    collection
} from "firebase/firestore";
import { useContext, useMemo, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Header from "../components/Header";
import { CartContext } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../services/firebaseConfig";

export default function BookDetailScreen({ route, navigation }) {
  const { book } = route.params;
  const { addToCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = auth.currentUser;

  const isOwner = user && book.ownerId === user.uid;

  // ------------------------ Add to Cart ------------------------
  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to add books to your cart.");
      return;
    }

    if (isOwner) {
      Alert.alert("Not Allowed", "You cannot add your own book to cart.");
      return;
    }

    try {
      await addDoc(collection(db, "cart"), {
        userId: user.uid,
        bookId: book.id,
        title: book.title,
        author: book.author,
        image: book.image || null,
        price: book.price || 0,
        addedAt: new Date().toISOString(),
      });

      addToCart(book);
      Alert.alert("Added!", `"${book.title}" added to your cart.`);
    } catch (error) {
      console.error("Cart Error:", error);
      Alert.alert("Error", "Could not add book to cart.");
    }
  };

  // ------------------------ Rent Now (Navigate Only) ------------------------
  const handleRentBook = () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to rent a book.");
      return;
    }

    if (isOwner) {
      Alert.alert("Not Allowed", "You cannot rent your own book.");
      return;
    }

    if (!book.isAvailable) {
      Alert.alert("Unavailable", "This book is currently rented.");
      return;
    }

    // ✔ No renting logic here
    // ✔ No notifications here
    // ✔ Only navigate to checkout
    navigation.navigate("Checkout", {
      cart: [book],
      singleBook: true,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title="Book Details"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Amazon-style book preview */}
        <View style={styles.coverWrapper}>
          <Image
            source={{
              uri: book.image || "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
            }}
            style={styles.coverImage}
            resizeMode="contain"
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>by {book.author}</Text>

          <Text style={styles.description}>
            {book.description || "No description available."}
          </Text>

          <Text style={styles.priceText}>₹ {book.price || 0}</Text>

          <Text
            style={[
              styles.availability,
              { color: book.isAvailable ? "#4CAF50" : "#F44336" },
            ]}
          >
            {book.isAvailable ? "Available" : "Currently Rented"}
          </Text>

          {/* Add to Cart */}
          <TouchableOpacity
            style={[
              styles.cartButton,
              isOwner && { backgroundColor: "#bbb" },
            ]}
            disabled={isOwner}
            onPress={handleAddToCart}
          >
            <Text style={styles.cartText}>
              {isOwner ? "You Own This Book" : "🛒 Add to Cart"}
            </Text>
          </TouchableOpacity>

          {/* Rent Now */}
          <TouchableOpacity
            style={[
              styles.rentButton,
              (!book.isAvailable || isOwner) && { backgroundColor: "#888" },
            ]}
            disabled={!book.isAvailable || isOwner}
            onPress={handleRentBook}
          >
            <Text style={styles.rentText}>
              {isOwner
                ? "You Own This Book"
                : book.isAvailable
                ? "Rent Now"
                : "Unavailable"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ------------------------------------------------------------------

const createStyles = (theme) => StyleSheet.create({
  container: { padding: 20 },

  coverWrapper: {
    width: "100%",
    height: 380,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    padding: 20,
    elevation: 6,
  },

  coverImage: {
    width: "70%",
    height: "100%",
    borderRadius: 10,
  },

  infoContainer: {
    width: "100%",
    alignItems: "flex-start",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 4,
  },

  author: {
    fontSize: 16,
    color: theme.colors.subText,
    marginBottom: 15,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.subText,
    marginBottom: 20,
  },

  priceText: {
    fontSize: 26,
    fontWeight: "bold",
    color: theme.colors.primary,
  },

  availability: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 25,
  },

  cartButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },

  cartText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  rentButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },

  rentText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
