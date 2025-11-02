import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function _layout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FF8C42", // Active icon and text color
          tabBarInactiveTintColor: "#8B4513", // Inactive icon and text color
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
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
          name="MenuEditor"
          options={{
            title: "Menu Editor",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "list" : "list-outline"}
                size={size}
                color={focused ? "#FF8C42" : color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="borders"
          options={{
            title: "Borders",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={size}
                color={focused ? "#FF8C42" : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="monthlyMeals"
          options={{
            title: "Monthly Meals",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
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
