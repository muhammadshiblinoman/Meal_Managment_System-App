import { db } from "@/firebaseConfig";
import { onValue, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MealPriceEditor({ role }: { role: string }) {
  const [prices, setPrices] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load meal prices
    const priceRef = ref(db, "mealPrices");
    onValue(priceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPrices({
          breakfast: String(data.breakfast),
          lunch: String(data.lunch),
          dinner: String(data.dinner),
        });
      }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const parsedPrices = {
      breakfast: Number(prices.breakfast),
      lunch: Number(prices.lunch),
      dinner: Number(prices.dinner),
    };
    try {
      await set(ref(db, "mealPrices"), parsedPrices);
    } catch (error) {
      console.error("Error saving prices:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Meal Prices</Text>
        {role === "admin" && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealIcon}>🍳</Text>
            <Text style={styles.mealLabel}>Breakfast</Text>
          </View>
          <TextInput
            style={[styles.input, role !== "admin" && styles.disabledInput]}
            keyboardType="numeric"
            placeholder="Enter price"
            value={prices.breakfast}
            onChangeText={(v) => setPrices({ ...prices, breakfast: v })}
            editable={role === "admin"}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealIcon}>🍛</Text>
            <Text style={styles.mealLabel}>Lunch</Text>
          </View>
          <TextInput
            style={[styles.input, role !== "admin" && styles.disabledInput]}
            keyboardType="numeric"
            placeholder="Enter price"
            value={prices.lunch}
            onChangeText={(v) => setPrices({ ...prices, lunch: v })}
            editable={role === "admin"}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealIcon}>🍲</Text>
            <Text style={styles.mealLabel}>Dinner</Text>
          </View>
          <TextInput
            style={[styles.input, role !== "admin" && styles.disabledInput]}
            keyboardType="numeric"
            placeholder="Enter price"
            value={prices.dinner}
            onChangeText={(v) => setPrices({ ...prices, dinner: v })}
            editable={role === "admin"}
          />
        </View>

        {role === "admin" && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Update Prices</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FF8C42",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  adminBadge: {
    backgroundColor: "#6c757d",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  mealIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  mealLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#f8f9fa",
    color: "#6c757d",
  },
  saveButton: {
    backgroundColor: "#5A3E2B",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});