// App.js
import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import MainNavigator from "./src/navigation/MainNavigator";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
