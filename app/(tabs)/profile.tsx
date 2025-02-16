import { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TextInput } from "@/components/TextInput";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { DATABASE_NAME } from "../_layout";
import { sql } from "drizzle-orm";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface UserSetup {
  name: string;
  motivation: string;
  goal: number;
  payday_schedule: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [userSetup, setUserSetup] = useState<UserSetup | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserSetup>({
    name: "",
    motivation: "",
    goal: 0,
    payday_schedule: "",
  });

  const db = drizzle(openDatabaseSync(DATABASE_NAME), { schema });

  useEffect(() => {
    loadUserSetup();
  }, []);

  const loadUserSetup = async () => {
    const setup = await db.query.userSetupTable.findFirst({
      orderBy: (users, { desc }) => [desc(users.created_at)],
    });

    if (setup) {
      const userData = {
        name: setup.name,
        motivation: setup.motivation,
        goal: setup.goal,
        payday_schedule: setup.payday_schedule,
      };
      setUserSetup(userData);
      setFormData(userData);
    }
  };

  const handleUpdate = async () => {
    const setup = await db.query.userSetupTable.findFirst({
      orderBy: (users, { desc }) => [desc(users.created_at)],
    });

    if (setup) {
      await db
        .update(schema.userSetupTable)
        .set({
          name: formData.name,
          motivation: formData.motivation,
          goal: formData.goal,
          payday_schedule: formData.payday_schedule,
          updated_at: new Date().toISOString(),
        })
        .where(sql`${schema.userSetupTable.id} = ${setup.id}`);

      setUserSetup(formData);
      setIsEditing(false);
    }
  };

  if (!userSetup) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText type="title" style={styles.headerTitle}>
              Loading...
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  }

  if (isEditing) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText type="title" style={styles.headerTitle}>
              Edit Profile
            </ThemedText>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card>
            <View style={styles.section}>
              <ThemedText type="subtitle">Name</ThemedText>
              <TextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                style={styles.input}
              />
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Savings Motivation</ThemedText>
              <TextInput
                value={formData.motivation}
                onChangeText={(text) =>
                  setFormData({ ...formData, motivation: text })
                }
                style={styles.input}
              />
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Savings Goal</ThemedText>
              <TextInput
                value={formData.goal.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, goal: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={[styles.section, styles.lastSection]}>
              <ThemedText type="subtitle">Payday Schedule</ThemedText>
              <TextInput
                value={formData.payday_schedule}
                onChangeText={(text) =>
                  setFormData({ ...formData, payday_schedule: text })
                }
                style={styles.input}
              />
            </View>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleUpdate}
              style={styles.button}
              disabled={
                !formData.name ||
                !formData.motivation ||
                !formData.goal ||
                !formData.payday_schedule
              }
            >
              Save Changes
            </Button>
            <Button
              onPress={() => {
                setFormData(userSetup);
                setIsEditing(false);
              }}
              style={styles.button}
              textStyle={{ color: "#fff" }}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Profile
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.label}>
              Name
            </ThemedText>
            <ThemedText style={styles.value}>{userSetup.name}</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.label}>
              Savings Motivation
            </ThemedText>
            <ThemedText style={styles.value}>{userSetup.motivation}</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.label}>
              Savings Goal
            </ThemedText>
            <ThemedText style={styles.value}>
              ${userSetup.goal.toLocaleString()}
            </ThemedText>
          </View>

          <View style={[styles.section, styles.lastSection]}>
            <ThemedText type="subtitle" style={styles.label}>
              Payday Schedule
            </ThemedText>
            <ThemedText style={styles.value}>
              {userSetup.payday_schedule}
            </ThemedText>
          </View>
        </Card>

        <Button onPress={() => setIsEditing(true)} style={styles.button}>
          Edit Profile
        </Button>
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
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 0,
  },
  label: {
    marginBottom: 4,
    opacity: 0.7,
  },
  value: {
    fontSize: 17,
  },
  input: {
    marginTop: 8,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginTop: 12,
  },
});
