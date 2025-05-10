import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const GUILT_MESSAGES = [
  "Still haven't saved for this month? Don't cry when you're eating instant noodles for dinner.",
  "Oh, skipping savings again? Hope your future self enjoys being broke.",
  "No savings yet? Remember, emergencies don't take rainchecks.",
  "Still living that 'YOLO' life, huh? Just don't complain when payday feels like a mirage.",
  "Savings: 0. Excuses: 100. Good luck explaining that to your hungry stomach later.",
  "Your future self called. They're not happy with your savings habits.",
  "Another day without savings? Your bank account is getting lonely.",
  "Procrastinating on savings? That's a bold strategy. Let's see how it plays out.",
  "Your wallet called, it's feeling lighter than your excuses.",
  "Remember when you said you'd save? Pepperidge Farm remembers.",
];

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#A1CEDC",
    });
  }

  return true;
}

export async function scheduleGuiltNotification() {
  const randomMessage =
    GUILT_MESSAGES[Math.floor(Math.random() * GUILT_MESSAGES.length)];

  // Schedule for tomorrow at 10 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Savings Reminder 💸",
      body: randomMessage,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.floor((tomorrow.getTime() - Date.now()) / 1000),
      repeats: false,
    },
  });
}

export async function cancelAllGuiltNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function checkAndScheduleGuiltNotification(
  currentSavings: number,
  goal: number
) {
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Only start guilt-tripping if we're past the deadline AND haven't met the goal
  if (today.getTime() > lastDayOfMonth.getTime() && currentSavings < goal) {
    await scheduleGuiltNotification();
    return true;
  }

  return false;
}

// Debug function to trigger immediate notification
export async function triggerDebugNotification() {
  const randomMessage =
    GUILT_MESSAGES[Math.floor(Math.random() * GUILT_MESSAGES.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Debug Notification 🐛",
      body: randomMessage,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null, // null trigger means show immediately
  });
}

// Debug function to test scheduled notifications
export async function triggerDebugScheduledNotification() {
  const randomMessage =
    GUILT_MESSAGES[Math.floor(Math.random() * GUILT_MESSAGES.length)];

  // Schedule for 10 seconds from now for quick testing
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Debug Scheduled 🕒",
      body: randomMessage,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10, // Will show after 10 seconds
      repeats: false,
    },
  });

  // Return when the notification will trigger
  const triggerDate = new Date(Date.now() + 10000);
  return triggerDate.toLocaleTimeString();
}
