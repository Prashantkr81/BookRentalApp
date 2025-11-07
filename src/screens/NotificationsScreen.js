import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";
import Header from "../components/Header";

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        // 🔹 Fetch notifications for logged-in user
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(fetched);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: "#555" }}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Reusable Header */}
      <Header
        title="Notifications"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* 📩 Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No new notifications yet 📭</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 10 }}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.read && styles.unread]}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.date}>
                {new Date(item.timestamp?.toDate()).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#888" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  unread: { borderLeftWidth: 5, borderLeftColor: "#2196F3" },
  message: { fontSize: 15, color: "#333" },
  date: { fontSize: 12, color: "#888", marginTop: 6, textAlign: "right" },
});
