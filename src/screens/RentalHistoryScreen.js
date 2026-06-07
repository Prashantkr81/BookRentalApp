import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View
} from "react-native";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../services/firebaseConfig";

const Tab = createMaterialTopTabNavigator();

// --------------------------------------------------
// 🔵 TAB 1 — Rented By ME
// --------------------------------------------------
function RentedByMe() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "rentals"), where("userId", "==", user.uid));
      const snap = await getDocs(q);

      const temp = [];

      for (let item of snap.docs) {
        const data = item.data();

        // fetch owner name
        let ownerName = "Owner";
        try {
          const ref = doc(db, "users", data.ownerId);
          const s = await getDoc(ref);
          if (s.exists()) ownerName = s.data().name;
        } catch {}

        temp.push({
          id: item.id,
          ownerName,
          ...data,
        });
      }

      setList(temp);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }) => {
    const rentedOn = new Date(item.rentedAt).toDateString();
    const returnDate = item.returnDate
      ? new Date(item.returnDate).toDateString()
      : "N/A";

    return (
      <View style={styles.card}>
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
          <Text style={styles.text}>📅 Rented On: {rentedOn}</Text>
          <Text style={styles.text}>🎯 Return Date: {returnDate}</Text>
          <Text style={styles.text}>📘 Owner: {item.ownerName}</Text>
          <Text style={styles.status}>Status: {item.status}</Text>
        </View>
      </View>
    );
  };

  if (loading)
    return <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 30 }} />;

  if (list.length === 0)
    return <Text style={styles.empty}>No rental history found.</Text>;

  return (
    <FlatList
      data={list}
      keyExtractor={(i) => i.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 10 }}
    />
  );
}

// --------------------------------------------------
// 🟠 TAB 2 — Rented FROM ME (My books rented by others)
// --------------------------------------------------
function RentedFromMe() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const fetchMyBooksHistory = async () => {
    try {
      const q = query(collection(db, "rentals"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);

      const temp = [];

      for (let item of snap.docs) {
        const data = item.data();

        // fetch renter name
        let renterName = "User";
        try {
          const ref = doc(db, "users", data.userId);
          const s = await getDoc(ref);
          if (s.exists()) renterName = s.data().name;
        } catch {}

        temp.push({
          id: item.id,
          renterName,
          ...data,
        });
      }

      setList(temp);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBooksHistory();
  }, []);

  const renderItem = ({ item }) => {
    const rentedOn = new Date(item.rentedAt).toDateString();
    const returnDate = item.returnDate
      ? new Date(item.returnDate).toDateString()
      : "N/A";

    return (
      <View style={styles.card}>
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
          <Text style={styles.text}>📅 Rented On: {rentedOn}</Text>
          <Text style={styles.text}>🎯 Return Date: {returnDate}</Text>
          <Text style={styles.text}>👤 Rented By: {item.renterName}</Text>
          <Text style={styles.status}>Status: {item.status}</Text>
        </View>
      </View>
    );
  };

  if (loading)
    return <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 30 }} />;

  if (list.length === 0)
    return <Text style={styles.empty}>No users have rented your books yet.</Text>;

  return (
    <FlatList
      data={list}
      keyExtractor={(i) => i.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 10 }}
    />
  );
}

// --------------------------------------------------
// MAIN SCREEN WITH TABS
// --------------------------------------------------
export default function RentalHistoryScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Rental History" showBack={true} onBackPress={() => navigation.goBack()} />

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.subText,
          tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
          tabBarStyle: { backgroundColor: theme.colors.card, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border },
        }}
      >
        <Tab.Screen name="Rented By Me" component={RentedByMe} />
        <Tab.Screen name="Rented From Me" component={RentedFromMe} />
      </Tab.Navigator>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  image: { width: 75, height: 110, borderRadius: 8, marginRight: 10 },
  title: { fontSize: 17, fontWeight: "bold", color: theme.colors.text },
  author: { fontSize: 14, color: theme.colors.subText },
  text: { marginTop: 4, fontSize: 13, color: theme.colors.text },
  status: { marginTop: 6, color: "green", fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 40, fontSize: 16, color: theme.colors.subText },
});
