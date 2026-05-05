import React, { createContext, useState, useContext, useEffect } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const theme = {
    isDarkMode,
    colors: {
      background: isDarkMode ? "#121212" : "#F5F5F5",
      card: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      text: isDarkMode ? "#FFFFFF" : "#000000",
      subText: isDarkMode ? "#CCCCCC" : "#555555",
      primary: "#2196F3",
      border: isDarkMode ? "#333" : "#DDD",
    },
  };

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === "dark");
    });
    return () => listener.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
