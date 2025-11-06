import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import AddBookScreen from "../screens/AddBookScreen";
import ProfileScreen from "../screens/ProfileScreen";
import WishlistScreen from "../screens/WishlistScreen";
import MyRentalsScreen from "../screens/MyRentalsScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add Book" component={AddBookScreen} />
      <Tab.Screen name="My Rentals" component={MyRentalsScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
