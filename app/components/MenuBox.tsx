import { db } from "@/firebaseConfig";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MenuBox() {
  const [menu, setMenu] = useState({ breakfast: "", lunch: "", dinner: "" });

  useEffect(() => {
    const menuRef = ref(db, "/menu/weekly");

    const unsubscribe = onValue(
      menuRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setMenu({ breakfast: "", lunch: "", dinner: "" });
          return;
        }
        const entries = Array.isArray(data) ? data : Object.values(data);
        const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        const tomorrowIndex = (new Date().getDay() + 1) % 7;
        const tomorrowKey = dayMap[tomorrowIndex];

        const tomorrowEntry = entries.find(
          (e: any) => (e?.day || "").toString().toLowerCase() === tomorrowKey
        );

        if (tomorrowEntry) {
          setMenu({
            breakfast: tomorrowEntry.breakfast || "",
            lunch: tomorrowEntry.lunch || "",
            dinner: tomorrowEntry.dinner || "",
          });
        } else {
          setMenu({ breakfast: "", lunch: "", dinner: "" });
        }
      },
      (error) => {
        console.warn("Failed to read weekly menu:", error);
        setMenu({ breakfast: "", lunch: "", dinner: "" });
      }
    );

    return () => unsubscribe();
  }, []);
 

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tomorrow's Menu</Text>
      </View>
      
      <View style={styles.menuContainer}>
        <View style={styles.menuItem}>
          <View style={[styles.iconContainer, styles.breakfastIcon]}>
            <Text style={styles.icon}>🥚</Text>
          </View>
          <View style={styles.menuDetails}>
            <Text style={styles.mealType}>Breakfast</Text>
            <Text style={styles.mealDescription} numberOfLines={2}>
              {menu.breakfast || "Menu not set yet"}
            </Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.menuItem}>
          <View style={[styles.iconContainer, styles.lunchIcon]}>
            <Text style={styles.icon}>🍛</Text>
          </View>
          <View style={styles.menuDetails}>
            <Text style={styles.mealType}>Lunch</Text>
            <Text style={styles.mealDescription} numberOfLines={2}>
              {menu.lunch || "Menu not set yet"}
            </Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.menuItem}>
          <View style={[styles.iconContainer, styles.dinnerIcon]}>
            <Text style={styles.icon}>🍲</Text>
          </View>
          <View style={styles.menuDetails}>
            <Text style={styles.mealType}>Dinner</Text>
            <Text style={styles.mealDescription} numberOfLines={2}>
              {menu.dinner || "Menu not set yet"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
   flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FF8C42",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  breakfastIcon: {
    backgroundColor: "#FFF5E6", // Light orange
  },
  lunchIcon: {
    backgroundColor: "#F2F0E6", // Light cream
  },
  dinnerIcon: {
    backgroundColor: "#F5E9DB", // Light brown
  },
  icon: {
    fontSize: 24,
  },
  menuDetails: {
    flex: 1,
  },
  mealType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513", // Brown
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 14,
    color: "#5A3E2B", // Dark brown
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0E6D6", // Light cream
    marginVertical: 4,
  },
});