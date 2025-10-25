import { Stack } from "expo-router";
import '../utils/socket';  // Import socket để kết nối tự động

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
