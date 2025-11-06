import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../services/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, "users", userCredential.user.uid), { name, email });
      alert("Registration successful!");
      navigation.navigate("Login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>Register</Text>
      <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <Button title="Register" onPress={handleRegister} />
      <Text style={{ textAlign: "center", marginTop: 15 }}>
        Already have an account? <Text style={{ color: "blue" }} onPress={() => navigation.navigate("Login")}>Login</Text>
      </Text>
    </View>
  );
}
