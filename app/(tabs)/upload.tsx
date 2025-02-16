import { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { DATABASE_NAME } from "../_layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { cancelAllGuiltNotifications } from "@/utils/notifications";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });
  const db = drizzle(openDatabaseSync(DATABASE_NAME), { schema });

  const getAvailableMonths = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const months = [];

    // Add months from current year
    for (let i = 0; i <= currentMonth; i++) {
      months.push({ month: i, year: currentYear });
    }

    // Add months from previous year if we're in the first few months
    if (currentMonth < 2) {
      // Show up to 2 months from previous year
      const prevYear = currentYear - 1;
      for (let i = 11; i >= Math.max(11 - (1 - currentMonth), 0); i--) {
        months.unshift({ month: i, year: prevYear });
      }
    }

    return months;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need gallery permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 1,
    });

    if (!result.canceled) {
      // Optimize the image for OCR
      const optimizedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }, { rotate: 0 }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setImage(optimizedImage.uri);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    try {
      // Create form data for the image upload
      const formData = new FormData();
      formData.append("file", {
        uri: image,
        type: "image/jpeg",
        name: "transfer.jpg",
      } as any);

      // Send image to OCR API
      const response = await fetch(
        "https://s4ofd6.buildship.run/vision-file-upload",
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();

      if (data.status === "200" && data.value?.base_amount) {
        // Save transaction with extracted amount and selected month
        const transactionDate = new Date(
          selectedMonth.year,
          selectedMonth.month,
          1
        );
        await db.insert(schema.transactionsTable).values({
          amount: data.value.base_amount,
          date: transactionDate.toISOString(),
        });

        // Calculate total saved this month to check if goal is met
        const transactions = await db.query.transactionsTable.findMany({
          where: (tx, { gte }) => gte(tx.date, transactionDate.toISOString()),
        });

        const totalSaved = transactions.reduce((sum, tx) => sum + tx.amount, 0);

        // Get user's goal
        const userSetup = await db.query.userSetupTable.findFirst({
          orderBy: (users, { desc }) => [desc(users.created_at)],
        });

        // If goal is met, cancel guilt notifications
        if (userSetup && totalSaved >= userSetup.goal) {
          await cancelAllGuiltNotifications();
        }

        Alert.alert(
          "Success! 🎉",
          `Saved $${data.value.base_amount.toLocaleString()}`,
          [{ text: "View Progress", onPress: () => router.back() }]
        );
      } else {
        throw new Error("Could not extract amount from image");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert(
        "Upload Failed",
        "Could not process the image. Please make sure the amount is clearly visible and try again.",
        [{ text: "Try Again", style: "default" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const availableMonths = getAvailableMonths();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Upload Proof
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Card>
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <IconSymbol name="calendar" size={24} color="#A1CEDC" />
              <ThemedText type="subtitle" style={styles.label}>
                Savings Month
              </ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.monthsContainer}
            >
              {availableMonths.map((item) => (
                <Pressable
                  key={`${item.year}-${item.month}`}
                  style={[
                    styles.monthButton,
                    selectedMonth.month === item.month &&
                      selectedMonth.year === item.year &&
                      styles.monthButtonSelected,
                  ]}
                  onPress={() => setSelectedMonth(item)}
                >
                  <ThemedText
                    style={[
                      styles.monthText,
                      selectedMonth.month === item.month &&
                        selectedMonth.year === item.year &&
                        styles.monthTextSelected,
                    ]}
                  >
                    {MONTHS[item.month]}{" "}
                    {item.year !== new Date().getFullYear() ? item.year : ""}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <IconSymbol name="photo" size={24} color="#A1CEDC" />
              <ThemedText type="subtitle" style={styles.label}>
                Transfer Screenshot
              </ThemedText>
            </View>
            <ThemedText style={styles.description}>
              Upload a photo of your savings transfer confirmation. Make sure
              the amount is clearly visible.
            </ThemedText>
          </View>

          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <Button onPress={pickImage} style={styles.retakeButton}>
                Choose Another
              </Button>
            </View>
          ) : (
            <Button onPress={pickImage} style={styles.button}>
              Choose Image
            </Button>
          )}
        </Card>

        {image && (
          <Button
            onPress={processImage}
            style={styles.processButton}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Save Transfer"}
          </Button>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 41,
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  label: {
    marginBottom: 0,
    lineHeight: 24,
  },
  description: {
    opacity: 0.6,
    marginBottom: 16,
  },
  monthsContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#333333",
  },
  monthButtonSelected: {
    backgroundColor: "#1D3D47",
  },
  monthText: {
    fontSize: 14,
    color: "#999",
  },
  monthTextSelected: {
    color: "#A1CEDC",
    fontWeight: "600",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  retakeButton: {
    backgroundColor: "#666",
  },
  processButton: {
    marginTop: 20,
  },
});
