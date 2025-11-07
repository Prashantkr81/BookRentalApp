import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("✅ Registration Successful!", "You can now log in.");
    } catch (error) {
      console.error("❌ Registration error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
