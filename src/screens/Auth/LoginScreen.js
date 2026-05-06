import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useContext, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { auth } from "../../services/firebaseConfig";

export default function LoginScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        placeholderTextColor={theme.colors.subText}
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.colors.subText}
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
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      <Text style={styles.linkText}>
        Don’t have an account?{" "}
        <Text
          style={{ color: theme.colors.primary, fontWeight: "bold" }}
          onPress={() => navigation.navigate("Register")}
        >
          Register
        </Text>
      </Text>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background, justifyContent: "center" },
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
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    textAlign: "right",
    marginBottom: 20,
    fontWeight: "500",
  },
  linkText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: theme.colors.subText,
  },
});
