import { Stack } from "expo-router";
import '../utils/socket';  // Import socket để kết nối tự động
import { AuthProvider } from '../hooks/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}
