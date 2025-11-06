import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

export default function BookCard({ book }) {
  return (
    <TouchableOpacity style={{ marginVertical: 10, backgroundColor: "#fff", borderRadius: 10, padding: 10 }}>
      <Image source={{ uri: book.image }} style={{ width: "100%", height: 200, borderRadius: 10 }} />
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{book.title}</Text>
      <Text style={{ color: "gray" }}>{book.author}</Text>
    </TouchableOpacity>
  );
}
