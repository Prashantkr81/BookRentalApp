import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Header from "../components/Header";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Header
        title="Book Rental Home"
        rightIcon="search-outline"
        onRightPress={() => navigation.navigate("Search")}
      />

      <View style={styles.body}>
        <Text style={styles.welcomeText}>Welcome to Book Rental 📚</Text>
        <Text style={styles.subText}>Find, rent, or lend books in your area</Text>
      </View>

      {/* You can later add book list / category cards here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  body: { padding: 16 },
  welcomeText: { fontSize: 20, fontWeight: "bold", color: "#333" },
  subText: { fontSize: 14, color: "#666", marginTop: 6 },
});
