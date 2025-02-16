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
import { UserSetupInsert } from "@/db/schema";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  triggerDebugNotification,
  triggerDebugScheduledNotification,
} from "@/utils/notifications";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [userSetup, setUserSetup] = useState<UserSetupInsert | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserSetupInsert>({
    name: "",
    motivation: "",
    goal: 0,
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
              <View style={styles.labelContainer}>
                <IconSymbol name="person.fill" size={16} color="#A1CEDC" />
                <ThemedText type="subtitle" style={styles.label}>
                  Name
                </ThemedText>
              </View>
              <TextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                style={styles.input}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <IconSymbol name="heart.fill" size={16} color="#A1CEDC" />
                <ThemedText type="subtitle" style={styles.label}>
                  Savings Motivation
                </ThemedText>
              </View>
              <TextInput
                value={formData.motivation}
                onChangeText={(text) =>
                  setFormData({ ...formData, motivation: text })
                }
                style={[styles.input, styles.textArea]}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.divider} />

            <View style={[styles.section, styles.lastSection]}>
              <View style={styles.labelContainer}>
                <IconSymbol name="star.fill" size={16} color="#A1CEDC" />
                <ThemedText type="subtitle" style={styles.label}>
                  Savings Goal
                </ThemedText>
              </View>
              <TextInput
                value={formData.goal.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, goal: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </Card>

          <View style={styles.divider} />

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleUpdate}
              style={styles.button}
              disabled={
                !formData.name || !formData.motivation || !formData.goal
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
            <View style={styles.labelContainer}>
              <IconSymbol name="person.fill" size={16} color="#A1CEDC" />
              <ThemedText type="subtitle" style={styles.label}>
                Name
              </ThemedText>
            </View>
            <ThemedText style={styles.value}>{userSetup.name}</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <IconSymbol name="heart.fill" size={16} color="#A1CEDC" />
              <ThemedText type="subtitle" style={styles.label}>
                Savings Motivation
              </ThemedText>
            </View>
            <ThemedText style={styles.value}>{userSetup.motivation}</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.lastSection}>
            <View style={styles.labelContainer}>
              <IconSymbol name="star.fill" size={16} color="#A1CEDC" />
              <ThemedText type="subtitle" style={styles.label}>
                Savings Goal
              </ThemedText>
            </View>
            <ThemedText style={styles.value}>
              ${userSetup.goal.toLocaleString()}
            </ThemedText>
          </View>
        </Card>

        <Button onPress={() => setIsEditing(true)} style={styles.button}>
          Edit Profile
        </Button>

        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Button
              onPress={triggerDebugNotification}
              style={styles.debugButton}
            >
              Test Immediate Notification
            </Button>
            <Button
              onPress={async () => {
                const time = await triggerDebugScheduledNotification();
                setScheduledTime(time);
              }}
              style={styles.debugButton}
            >
              Test Scheduled Notification (10s)
            </Button>
            {scheduledTime && (
              <ThemedText style={styles.debugText}>
                Notification scheduled for: {scheduledTime}
              </ThemedText>
            )}
          </View>
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  lastSection: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  label: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 14,
    marginBottom: 0,
    color: "#999",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    marginTop: 8,
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
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#333",
    marginHorizontal: -16,
  },
  debugContainer: {
    marginTop: 20,
    gap: 8,
  },
  debugButton: {
    backgroundColor: "#666",
  },
  debugText: {
    textAlign: "center",
    opacity: 0.7,
    fontSize: 12,
  },
});
