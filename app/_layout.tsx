import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { ActivityIndicator } from "react-native";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

import migrations from "@/drizzle/migrations";
import * as schema from "@/db/schema";
export const DATABASE_NAME = "better_save_db";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const expoDB = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDB, { schema });
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    const checkSetup = async () => {
      const userSetup = await db.query.userSetupTable.findFirst({
        orderBy: (users, { desc }) => [desc(users.created_at)],
      });

      if (!userSetup || !userSetup.completed) {
        console.log("User setup not completed, redirecting to setup");
        router.replace("/setup");
      }

      console.log("User setup completed, redirecting to home");
      console.log(userSetup);
    };

    if (loaded) {
      SplashScreen.hideAsync();
      checkSetup();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName={DATABASE_NAME}>
        <Suspense fallback={<ActivityIndicator />}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="setup"
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
          </Stack>
        </Suspense>
      </SQLiteProvider>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
