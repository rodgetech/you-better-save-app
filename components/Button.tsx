import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({
  children,
  style,
  textStyle,
  disabled,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDark ? styles.buttonDark : styles.buttonLight,
        disabled && styles.buttonDisabled,
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <Text
        style={[
          styles.text,
          isDark ? styles.textDark : styles.textLight,
          disabled && styles.textDisabled,
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLight: {
    backgroundColor: "#A1CEDC",
  },
  buttonDark: {
    backgroundColor: "#1D3D47",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  textLight: {
    color: "#000",
  },
  textDark: {
    color: "#fff",
  },
  textDisabled: {
    color: "#666",
  },
});
