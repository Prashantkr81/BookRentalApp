import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import { AuthContext } from "../../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <Button title="Login" onPress={handleLogin} />
      <Text style={{ textAlign: "center", marginTop: 15 }}>
        Don’t have an account? <Text style={{ color: "blue" }} onPress={() => navigation.navigate("Register")}>Register</Text>
      </Text>
    </View>
  );
}
