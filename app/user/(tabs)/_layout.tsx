import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function _layout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF8C42", // Active icon and text color
        tabBarInactiveTintColor: "#8B4513", // Inactive icon and text color
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false, // Hide headers for all screens
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={focused ? "#FF8C42" : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={focused ? "#FF8C42" : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="myMeals"
        options={{
          title: "My Meals",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "restaurant" : "restaurant-outline"} 
              size={size} 
              color={focused ? "#FF8C42" : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="MyDeposits"
        options={{
          title: "My Deposits",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "wallet" : "wallet-outline"} 
              size={size} 
              color={focused ? "#FF8C42" : color} 
            />
          ),
        }}
      />
    </Tabs>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0D6C9",
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});