import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./AppNavigator"; // your bottom tabs
import BookDetailScreen from "../screens/BookDetailScreen"; // details screen
import CartScreen from "../screens/CartScreen";



const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 🧭 Bottom Tab Navigator */}
        <Stack.Screen name="AppTabs" component={AppNavigator} />

        {/* 📘 Book Detail Screen */}
        <Stack.Screen name="BookDetails" component={BookDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
