import { useEffect, useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { DATABASE_NAME } from "../_layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect } from "@react-navigation/native";

const PROGRESS_CIRCLE = {
  strokeWidth: 12,
  size: 120,
};

const PROGRESS_COLORS = {
  low: {
    main: "#FF6B6B",
    background: "rgba(255, 107, 107, 0.2)",
  },
  medium: {
    main: "#FFD93D",
    background: "rgba(255, 217, 61, 0.2)",
  },
  high: {
    main: "#4CAF50",
    background: "rgba(76, 175, 80, 0.2)",
  },
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface UserSetup {
  name: string;
  goal: number;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [userSetup, setUserSetup] = useState<UserSetup | null>(null);
  const [totalSaved, setTotalSaved] = useState(0);
  const db = drizzle(openDatabaseSync(DATABASE_NAME), { schema });

  const loadData = useCallback(async () => {
    // Load user setup
    const setup = await db.query.userSetupTable.findFirst({
      orderBy: (users, { desc }) => [desc(users.created_at)],
    });

    if (setup) {
      setUserSetup({
        name: setup.name,
        goal: setup.goal,
      });
    }

    // Calculate total saved
    const transactions = await db.query.transactionsTable.findMany();
    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    setTotalSaved(total);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getDeadline = () => {
    const today = new Date();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    return `${MONTHS[today.getMonth()]} ${lastDayOfMonth.getDate()}`;
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

  const progressPercentage = Math.min((totalSaved / userSetup.goal) * 100, 100);
  const radius = (PROGRESS_CIRCLE.size - PROGRESS_CIRCLE.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  const getProgressColors = (percentage: number) => {
    if (percentage <= 33) return PROGRESS_COLORS.low;
    if (percentage <= 66) return PROGRESS_COLORS.medium;
    return PROGRESS_COLORS.high;
  };

  const progressColors = getProgressColors(progressPercentage);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Hi, {userSetup.name.split(" ")[0]}!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Let's check your progress
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <Card>
          <View style={styles.goalSection}>
            <View style={styles.progressCircle}>
              <Svg width={PROGRESS_CIRCLE.size} height={PROGRESS_CIRCLE.size}>
                <Circle
                  cx={PROGRESS_CIRCLE.size / 2}
                  cy={PROGRESS_CIRCLE.size / 2}
                  r={radius}
                  stroke={progressColors.background}
                  strokeWidth={PROGRESS_CIRCLE.strokeWidth}
                  fill="none"
                />
                <Circle
                  cx={PROGRESS_CIRCLE.size / 2}
                  cy={PROGRESS_CIRCLE.size / 2}
                  r={radius}
                  stroke={progressColors.main}
                  strokeWidth={PROGRESS_CIRCLE.strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${PROGRESS_CIRCLE.size / 2} ${
                    PROGRESS_CIRCLE.size / 2
                  })`}
                />
              </Svg>
              <View style={styles.progressTextContainer}>
                <ThemedText
                  style={[styles.progressText, { color: progressColors.main }]}
                >
                  {Math.round(progressPercentage)}%
                </ThemedText>
              </View>
            </View>

            <View style={styles.goalInfo}>
              <View style={styles.labelContainer}>
                <IconSymbol name="star.fill" size={16} color="#A1CEDC" />
                <ThemedText type="subtitle" style={styles.goalLabel}>
                  Savings Goal
                </ThemedText>
              </View>
              <ThemedText style={styles.goalAmount}>
                ${userSetup.goal.toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.targetDate}>
                Deadline: {getDeadline()}
              </ThemedText>
            </View>
          </View>
        </Card>

        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <View style={styles.labelContainer}>
              <IconSymbol
                name="arrow.up.circle.fill"
                size={16}
                color="#A1CEDC"
              />
              <ThemedText style={styles.statsLabel}>Saved</ThemedText>
            </View>
            <ThemedText style={styles.statsAmount}>
              ${totalSaved.toLocaleString()}
            </ThemedText>
          </Card>

          <Card style={styles.statsCard}>
            <View style={styles.labelContainer}>
              <IconSymbol name="hourglass" size={16} color="#A1CEDC" />
              <ThemedText style={styles.statsLabel}>Remaining</ThemedText>
            </View>
            <ThemedText style={styles.statsAmount}>
              ${Math.max(userSetup.goal - totalSaved, 0).toLocaleString()}
            </ThemedText>
          </Card>
        </View>
      </View>
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
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  goalSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  progressCircle: {
    width: PROGRESS_CIRCLE.size,
    height: PROGRESS_CIRCLE.size,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  progressTextContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#A1CEDC",
  },
  goalInfo: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalLabel: {
    fontSize: 16,
    opacity: 0.6,
    lineHeight: 16,
  },
  goalAmount: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 36,
  },
  targetDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  statsCard: {
    flex: 1,
    padding: 16,
  },
  statsLabel: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 14,
  },
  statsAmount: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 4,
  },
});
