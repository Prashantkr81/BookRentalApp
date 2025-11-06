import React, { useContext } from "react";
import { View, Text, Image, Button } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, setUser } = useContext(AuthContext);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <View style={{ alignItems: "center", marginTop: 50 }}>
      {user?.photoURL ? (
        <Image source={{ uri: user.photoURL }} style={{ width: 100, height: 100, borderRadius: 50 }} />
      ) : (
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "#ccc" }} />
      )}
      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 10 }}>{user?.displayName || "User"}</Text>
      <Text style={{ color: "gray", marginBottom: 20 }}>{user?.email}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
