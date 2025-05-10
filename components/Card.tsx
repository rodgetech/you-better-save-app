import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLight: {
    backgroundColor: "#fff",
    shadowColor: "#000",
  },
  cardDark: {
    backgroundColor: "#1c1c1e",
    shadowColor: "#000",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#333",
  },
});
