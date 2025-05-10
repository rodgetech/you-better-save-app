import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { TextInput } from "@/components/TextInput";
import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { DATABASE_NAME } from "./_layout";

export default function SetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [motivation, setMotivation] = useState("");
  const [goal, setGoal] = useState("");
  const [paydaySchedule, setPaydaySchedule] = useState("");

  const db = drizzle(openDatabaseSync(DATABASE_NAME), { schema });

  const handleComplete = async () => {
    // Save all the user setup data
    await db.insert(schema.userSetupTable).values({
      name,
      motivation,
      goal: parseInt(goal),
      payday_schedule: paydaySchedule,
      completed: 1,
    });

    // Navigate to the main app
    router.replace("/(tabs)");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <ThemedText type="title">What's your name?</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              style={styles.input}
            />
            <Button
              onPress={() => setStep(2)}
              disabled={!name}
              style={styles.button}
            >
              Next
            </Button>
          </View>
        );
      case 2:
        return (
          <View>
            <ThemedText type="title">What motivates you to save?</ThemedText>
            <TextInput
              value={motivation}
              onChangeText={setMotivation}
              placeholder="Enter your motivation"
              style={styles.input}
            />
            <Button
              onPress={() => setStep(3)}
              disabled={!motivation}
              style={styles.button}
            >
              Next
            </Button>
          </View>
        );
      case 3:
        return (
          <View>
            <ThemedText type="title">What's your savings goal?</ThemedText>
            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.input}
            />
            <Button
              onPress={() => setStep(4)}
              disabled={!goal}
              style={styles.button}
            >
              Next
            </Button>
          </View>
        );
      case 4:
        return (
          <View>
            <ThemedText type="title">When do you get paid?</ThemedText>
            <TextInput
              value={paydaySchedule}
              onChangeText={setPaydaySchedule}
              placeholder="e.g., 1st and 15th"
              style={styles.input}
            />
            <Button
              onPress={handleComplete}
              disabled={!paydaySchedule}
              style={styles.button}
            >
              Complete Setup
            </Button>
          </View>
        );
    }
  };

  return <ThemedView style={styles.container}>{renderStep()}</ThemedView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    marginVertical: 20,
  },
  button: {
    marginTop: 20,
  },
});
