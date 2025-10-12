// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="user" />
        <Stack.Screen name="admin" />
      </Stack>
    </>
  );
}
