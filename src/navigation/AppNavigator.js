import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useTheme } from "../context/ThemeContext";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import AddBookScreen from "../screens/AddBookScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: "absolute",
          bottom: 15,
          left: 15,
          right: 15,
          height: 70,
          borderRadius: 20,
          backgroundColor: theme.colors.card,
          borderTopWidth: 0,
          elevation: 12,

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },

        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;

            case "Search":
              iconName = focused ? "search" : "search-outline";
              break;

            case "AddBook":
              return (
                <View
                  style={[
                    styles.addButton,
                    {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Ionicons name="add" size={30} color="#fff" />
                </View>
              );

            case "Notifications":
              iconName = focused
                ? "notifications"
                : "notifications-outline";
              break;

            case "Cart":
              iconName = focused ? "cart" : "cart-outline";
              break;

            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;

            default:
              iconName = "ellipse-outline";
          }

          return (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  backgroundColor: `${theme.colors.primary}20`,
                },
              ]}
            >
              <Ionicons name={iconName} size={24} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen name="Search" component={SearchScreen} />

      <Tab.Screen
        name="AddBook"
        component={AddBookScreen}
        options={{
          tabBarLabel: "",
        }}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
});