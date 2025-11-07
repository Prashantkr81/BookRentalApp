import React from "react";
import MainNavigator from "./src/navigation/MainNavigator";
import { CartProvider } from "./src/context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <MainNavigator />
    </CartProvider>
  );
}
