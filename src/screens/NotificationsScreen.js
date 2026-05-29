import {
    collection,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../services/firebaseConfig";

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // 🟢 Real-time updates
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.text }}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>📭 No new notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.read && styles.unread]}
              onPress={() => handleMarkAsRead(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>
                  {item.timestamp?.toDate
                    ? item.timestamp.toDate().toLocaleString()
                    : new Date(item.timestamp).toLocaleString()}
                </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: theme.colors.subText },
  card: {
    backgroundColor: theme.colors.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  unread: { borderLeftWidth: 5, borderLeftColor: theme.colors.primary },
  message: { fontSize: 15, color: theme.colors.text, marginBottom: 6 },
  date: { fontSize: 12, color: theme.colors.subText, textAlign: "right" },
});
