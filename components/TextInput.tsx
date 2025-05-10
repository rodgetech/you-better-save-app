import React from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
  TextStyle,
  StyleProp,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

interface CustomTextInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

export function TextInput({ style, ...props }: CustomTextInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <RNTextInput
      style={[
        styles.input,
        isDark ? styles.inputDark : styles.inputLight,
        style,
      ]}
      placeholderTextColor={isDark ? "#666" : "#999"}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: "#fff",
    color: "#000",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  inputDark: {
    backgroundColor: "#333",
    color: "#fff",
    borderColor: "#666",
    borderWidth: 1,
  },
});
