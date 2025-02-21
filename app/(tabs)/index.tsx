import { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
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

const PROJECTIONS = [
  {
    months: 3,
    amount: (goal: number) => goal * 3,
    messages: [
      "You could buy a decent used car 🚗",
      "That's a solid emergency fund 🏦",
      "You could take a nice vacation ✈️",
    ],
  },
  {
    months: 6,
    amount: (goal: number) => goal * 6,
    messages: [
      "You're getting closer to a house down payment 🏠",
      "That's a serious investment portfolio start 📈",
      "You could start a small business 💼",
    ],
  },
  {
    months: 12,
    amount: (goal: number) => goal * 12,
    messages: [
      "You're building real wealth now 💎",
      "Financial freedom is within reach 🎯",
      "That's a life-changing amount of savings 🌟",
    ],
  },
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

  const getRandomMessage = (messages: string[]) => {
    return messages[Math.floor(Math.random() * messages.length)];
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
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

        <View style={styles.projectionsContainer}>
          <View style={{ ...styles.labelContainer, marginBottom: 12 }}>
            <IconSymbol name="sparkles" size={20} color="#A1CEDC" />
            <ThemedText style={{ ...styles.projectionsLabel, lineHeight: 0 }}>
              Your Savings Journey Ahead
            </ThemedText>
          </View>

          {PROJECTIONS.map((projection) => (
            <Card key={projection.months} style={styles.projectionCard}>
              <View style={styles.projectionHeader}>
                <ThemedText style={styles.projectionTime}>
                  In {projection.months}{" "}
                  {projection.months === 1 ? "month" : "months"}
                </ThemedText>
                <ThemedText style={styles.projectionAmount}>
                  ${projection.amount(userSetup.goal).toLocaleString()}
                </ThemedText>
              </View>
              <ThemedText style={styles.projectionMessage}>
                {getRandomMessage(projection.messages)}
              </ThemedText>
            </Card>
          ))}
        </View>
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
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
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
  projectionsContainer: {
    marginTop: 24,
  },
  projectionsLabel: {
    fontSize: 16,
    opacity: 0.8,
    fontWeight: "600",
  },
  projectionCard: {
    marginBottom: 12,
    padding: 16,
  },
  projectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  projectionTime: {
    fontSize: 14,
    opacity: 0.6,
  },
  projectionAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#A1CEDC",
  },
  projectionMessage: {
    fontSize: 16,
    opacity: 0.8,
  },
});
