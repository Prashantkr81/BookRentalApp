// src/navigation/MainNavigator.js
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import BookDetailScreen from "../screens/BookDetailScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import EditBookScreen from "../screens/EditBookScreen";
import LoadingScreen from "../screens/LoadingScreen";
import MyLibraryScreen from "../screens/MyLibraryScreen";
import NotificationScreen from "../screens/NotificationsScreen";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const { user, loading } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {loading ? (
          // ✅ Show loading screen while checking authentication
          <Stack.Screen 
            name="Loading" 
            component={LoadingScreen}
            options={{ animationEnabled: false }}
          />
        ) : !user ? (
          // ✅ User not logged in - Show Login page
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // ✅ User logged in - Show Home screen as startup
          <>
            <Stack.Screen name="AppTabs" component={AppNavigator} />
            
            {/* ✅ Additional screens accessible from tabs */}
            <Stack.Screen name="BookDetails" component={BookDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
            <Stack.Screen name="EditBookScreen" component={EditBookScreen} />
            <Stack.Screen name="MyLibrary" component={MyLibraryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
