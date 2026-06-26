import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="diary" />
        <Stack.Screen name="diary/new" />
        <Stack.Screen name="exercises" />
        <Stack.Screen name="exercises/[id]" />
        <Stack.Screen name="community" />
        <Stack.Screen name="community/[id]" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="profile" />
      </Stack>
    </>
  );
}
