import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import { AuthContext } from "../../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email to reset password");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "Password Reset Link Sent",
        "A password reset link has been sent to your email address."
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* 📱 App Logo */}
      <Image
        source={require("../../assets/images/app_logo.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {/* 🔗 Forgot Password */}
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 20 }} />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      <Text style={styles.linkText}>
        Don’t have an account?{" "}
        <Text
          style={{ color: "#2196F3", fontWeight: "bold" }}
          onPress={() => navigation.navigate("Register")}
        >
          Register
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5", justifyContent: "center" },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#6d6d6dff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  forgotPasswordText: {
    color: "#2196F3",
    textAlign: "right",
    marginBottom: 20,
    fontWeight: "500",
  },
  linkText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#555",
  },
});
