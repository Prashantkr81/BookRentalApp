import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import AddBookScreen from "../screens/AddBookScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SearchScreen from "../screens/SearchScreen";
import { Ionicons } from "@expo/vector-icons"; // ✅ Icon Library
import NotificationsScreen from "../screens/NotificationsScreen.js";
import CartScreen from "../screens/CartScreen";

// import BookDetailScreen from "../screens/BookDetailScreen";


const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#ddd",
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Search":
              iconName = focused ? "search" : "search-outline";
              break;
            case "Add Book":
              iconName = focused ? "add-circle" : "add-circle-outline";
              break;
            case "Notification":
              iconName = focused ? "notifications-outline" : "notifications-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Add Book" component={AddBookScreen} />
      <Tab.Screen name="Notification" component={NotificationsScreen} />
      <Tab.Screen
        name="Cart"
  component={CartScreen}
  options={{
    tabBarIcon: ({ color, size, focused }) => (<Ionicons name={focused ? "cart" : "cart-outline"} size={size} color={color} />),}}/>
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
