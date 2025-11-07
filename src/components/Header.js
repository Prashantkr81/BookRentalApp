import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header({ title, showBack = false, onBackPress, rightIcon, onRightPress }) {
  return (
    <View style={styles.headerContainer}>
      {/* Back Button */}
      {showBack ? (
        <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      {/* Title */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Right Icon (optional) */}
      {rightIcon ? (
        <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  iconButton: {
    padding: 6,
  },
  iconPlaceholder: {
    width: 30,
  },
});
