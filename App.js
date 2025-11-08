// App.js
import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import MainNavigator from "./src/navigation/MainNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainNavigator />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
