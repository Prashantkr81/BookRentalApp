import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth } from "../services/firebaseConfig";

// Create Context
export const AuthContext = createContext();

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track authentication state and persist to AsyncStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already logged in from AsyncStorage
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error retrieving stored user:", error);
      }
    };

    // Initialize stored user first
    initializeAuth();

    // Listen to Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User logged in - save to AsyncStorage
        try {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          setUser(firebaseUser);
        } catch (error) {
          console.error("Error saving user to AsyncStorage:", error);
          setUser(firebaseUser); // Still set user even if storage fails
        }
      } else {
        // User logged out
        try {
          await AsyncStorage.removeItem("user");
        } catch (error) {
          console.error("Error removing user from AsyncStorage:", error);
        }
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
