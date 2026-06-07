import DateTimePicker from "@react-native-community/datetimepicker";
import { addDoc, collection, doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useContext, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "../components/Header";
import { CartContext } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../services/firebaseConfig";

export default function CheckoutScreen({ route, navigation }) {
  const { cart } = route.params;
  const { clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = auth.currentUser;

  const total = cart.reduce((sum, book) => sum + (book.price || 0), 0);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const handleConfirmCheckout = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to complete checkout.");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Missing Address", "Please enter your delivery address.");
      return;
    }

    try {
      setLoading(true);

      for (let book of cart) {
        const bookRef = doc(db, "books", book.id);
        const bookSnap = await getDoc(bookRef);
        if (!bookSnap.exists()) continue;

        const bookData = bookSnap.data();

        if (!bookData.isAvailable) continue;

        // Update book to rented
        await updateDoc(bookRef, {
          isAvailable: false,
          rentedBy: user.uid,
          rentedAt: new Date().toISOString(),
        });

        // Save rental record
        await addDoc(collection(db, "rentals"), {
          userId: user.uid,
          ownerId: book.ownerId,
          bookId: book.id,
          title: book.title,
          author: book.author,
          image: book.image || null,
          price: book.price || 0,
          rentedAt: new Date().toISOString(),
          returnDate: date.toISOString(),
          address,
          paymentMethod,
          status: "rented",
        });

        // Notifications — centralized here ✅
        const renterName = user.displayName || "A renter";
        const ownerRef = doc(db, "users", book.ownerId);
        const ownerSnap = await getDoc(ownerRef);
        const ownerName = ownerSnap.exists() ? ownerSnap.data().name : "Owner";

        // Notify Owner
        await addDoc(collection(db, "notifications"), {
          userId: book.ownerId,
          message: `📘 Your book "${book.title}" was rented by ${renterName}. Deliver to: ${address}.`,
          timestamp: Timestamp.now(),
          read: false,
        });

        // Notify Renter
        await addDoc(collection(db, "notifications"), {
          userId: user.uid,
          message: `⏰ You rented "${book.title}". Please return it by ${date.toDateString()}.`,
          timestamp: Timestamp.now(),
          read: false,
        });
      }

      clearCart();
      Alert.alert("✅ Checkout Successful!", "Books will be delivered soon.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"), // Redirect to Home
        },
      ]
    );
      navigation.navigate("My Rentals");
    } catch (error) {
      console.error("Checkout error:", error);
      Alert.alert("❌ Failed to checkout", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Checkout" showBack={true} onBackPress={() => navigation.goBack()} />

      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>Confirm Rental</Text>
            {cart.map((item) => (
              <View key={item.id} style={styles.item}>
                <Image
                  source={{
                    uri: item.image || "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
                  }}
                  style={styles.image}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.author}>by {item.author}</Text>
                  <Text style={styles.price}>₹{item.price || 0}</Text>
                </View>
              </View>
            ))}

            <Text style={styles.label}>Delivery Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your address"
              placeholderTextColor={theme.colors.subText}
              value={address}
              onChangeText={setAddress}
              multiline
            />

            <Text style={styles.label}>Expected Return Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>{date.toDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.paymentContainer}>
              {["Cash on Delivery", "UPI", "Credit/Debit Card"].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentOption,
                    paymentMethod === method && styles.selectedPayment,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={{
                      color: paymentMethod === method ? "#fff" : theme.colors.text,
                      fontWeight: "bold",
                    }}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        data={[]}
        renderItem={null}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ₹{total}</Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirm Rental</Text>
              )}
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  heading: { fontSize: 20, fontWeight: "bold", margin: 15, color: theme.colors.text },
  item: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 8,
    alignItems: "center",
    elevation: 2,
  },
  image: { width: 70, height: 100, borderRadius: 6, marginRight: 10 },
  title: { fontSize: 16, fontWeight: "bold", color: theme.colors.text },
  author: { color: theme.colors.subText },
  price: { color: theme.colors.primary, fontWeight: "bold" },
  label: { fontSize: 16, fontWeight: "bold", marginHorizontal: 15, marginTop: 15, color: theme.colors.text },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlignVertical: "top",
    color: theme.colors.text,
  },
  dateButton: {
    backgroundColor: theme.colors.card,
    padding: 10,
    borderRadius: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  dateText: { fontSize: 15, color: theme.colors.text },
  paymentContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 15,
  },
  paymentOption: {
    backgroundColor: theme.colors.card,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  selectedPayment: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  footer: { backgroundColor: theme.colors.card, padding: 15, borderTopWidth: 0.5, borderColor: theme.colors.border },
  totalText: { fontSize: 18, fontWeight: "bold", color: theme.colors.text, marginBottom: 10 },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
