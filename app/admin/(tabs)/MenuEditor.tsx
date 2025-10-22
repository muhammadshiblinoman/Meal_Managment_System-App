import { db } from "@/firebaseConfig";
import { get, ref, set } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DAYS = [
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
];

type MealSet = {
  breakfast: string;
  lunch: string;
  dinner: string;
};

export default function MenuEditor() {
  // initialize meals with empty strings for all days
  const [meals, setMeals] = useState<Record<string, MealSet>>(() =>
    DAYS.reduce((acc, d) => {
      acc[d.id] = { breakfast: "", lunch: "", dinner: "" };
      return acc;
    }, {} as Record<string, MealSet>)
  );

  // keep track of which day panels are expanded; keys stable by day id
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    DAYS.reduce((acc, d) => {
      acc[d.id] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const [saving, setSaving] = useState(false);

  const toggleExpand = useCallback((dayId: string) => {
    setExpanded((prev) => ({ ...prev, [dayId]: !prev[dayId] }));
  }, []);

  // When a TextInput is focused, ensure its day panel stays expanded
  const handleFocus = useCallback((dayId: string) => {
    setExpanded((prev) => (prev[dayId] ? prev : { ...prev, [dayId]: true }));
  }, []);

  // stable updater for nested meal fields
  const updateMealField = useCallback(
    (dayId: string, field: keyof MealSet, value: string) => {
      setMeals((prev) => ({
        ...prev,
        [dayId]: {
          ...prev[dayId],
          [field]: value,
        },
      }));
    },
    []
  );

  // Load existing menu on mount and populate inputs
  useEffect(() => {
    const menuRef = ref(db, "/menu/weekly");
    const fetchMenu = async () => {
      try {
        const snapshot = await get(menuRef);
        if (!snapshot.exists()) return;

        const data = snapshot.val();

        // Normalize to array of entries with day property
        let entries: any[] = [];
        if (Array.isArray(data)) {
          entries = data;
        } else if (data && typeof data === "object") {
          // If stored as object keyed by day id
          entries = Object.entries(data).map(([k, v]: any) => ({
            day: k,
            ...(v || {}),
          }));
        }

        setMeals((prev) => {
          const next = { ...prev };
          entries.forEach((e: any) => {
            const dayId = (e.day || "").toString().toLowerCase();
            if (!dayId) return;
            if (!next[dayId]) {
              // If unknown day id, skip
              return;
            }
            next[dayId] = {
              breakfast: e.breakfast || "",
              lunch: e.lunch || "",
              dinner: e.dinner || "",
            };
          });
          return next;
        });
      } catch (err) {
        console.error("Failed to load weekly menu:", err);
      }
    };

    fetchMenu();
  }, []);

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      // Example payload; replace with your API call
      const payload = DAYS.map((d) => ({ day: d.id, ...meals[d.id] }));
      // Save to Firebase Realtime Database
      await set(ref(db, "/menu/weekly"), payload);
      Alert.alert("Success", "All days saved.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }, [meals]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Weekly Menu Editor</Text>
          <Text style={styles.headerSubtitle}>
            Fill meals for every day and tap Save All
          </Text>
        </View>
        <View style={styles.listContent}>
          {DAYS.map((day) => {
            const dayMeals = meals[day.id];
            const isExpanded = expanded[day.id];
            return (
              <View key={day.id} style={styles.dayAccordion}>
                <TouchableOpacity
                  onPress={() => toggleExpand(day.id)}
                  style={styles.dayHeader}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayHeaderText}>{day.label}</Text>
                  <Text style={styles.dayExpandIcon}>
                    {isExpanded ? "−" : "+"}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.dayContent}>
                    <View style={styles.mealContainer}>
                      <View style={styles.mealHeader}>
                        <Text style={styles.mealLabel}>Breakfast</Text>
                      </View>
                      <TextInput
                        style={styles.input}
                        multiline
                        value={dayMeals.breakfast}
                        onChangeText={(t) =>
                          updateMealField(day.id, "breakfast", t)
                        }
                        onFocus={() => handleFocus(day.id)}
                        
                        returnKeyType="default"
                        placeholder="Enter breakfast menu..."
                      />
                    </View>

                    <View style={styles.mealContainer}>
                      <View style={styles.mealHeader}>
                        <Text style={styles.mealLabel}>Lunch</Text>
                      </View>
                      <TextInput
                        style={styles.input}
                        multiline
                        value={dayMeals.lunch}
                        onChangeText={(t) =>
                          updateMealField(day.id, "lunch", t)
                        }
                        onFocus={() => handleFocus(day.id)}
                        
                        returnKeyType="default"
                        placeholder="Enter lunch menu..."
                      />
                    </View>

                    <View style={styles.mealContainer}>
                      <View style={styles.mealHeader}>
                        <Text style={styles.mealLabel}>Dinner</Text>
                      </View>
                      <TextInput
                        style={styles.input}
                        multiline
                        value={dayMeals.dinner}
                        onChangeText={(t) =>
                          updateMealField(day.id, "dinner", t)
                        }
                        onFocus={() => handleFocus(day.id)}
                        
                        returnKeyType="default"
                        placeholder="Enter dinner menu..."
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            onPress={saveAll}
            style={[
              styles.saveButton,
              saving ? styles.saveButtonSuccess : undefined,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {saving ? (
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              ) : null}
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save All Days"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8B4513",
  },
  header: {
    backgroundColor: "#FF8C42", // Orange
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    opacity: 0.9,
  },

  // ScrollView content container (used by MenuEditor)
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Re-used admin badge naming from borders.tsx (keeps compatibility if used)
  adminBadge: {
    backgroundColor: "#FF8C42",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  adminBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },

  // Menu-specific / accordion items: styled to match card-like appearance
  dayAccordion: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  dayHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
  },
  dayExpandIcon: {
    fontSize: 16,
    color: "#8B4513",
    fontWeight: "700",
    paddingHorizontal: 8,
  },
  dayContent: {
    paddingTop: 10,
    backgroundColor: "transparent",
  },

  // Meal rows
  mealContainer: {
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  mealIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  mealLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5A3E2B",
  },

  // Input styling aligned with borders.tsx palette
  input: {
    borderWidth: 1,
    borderColor: "#E0D6C9",
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    backgroundColor: "#F9F5F0",
    // minHeight: 60,
    textAlignVertical: "top",
    color: "#5A3E2B",
  },

  // Save button mirrors roleButton / promote styles from borders.tsx but full width
  saveButton: {
    backgroundColor: "#5A3E2B",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  saveButtonSuccess: {
    backgroundColor: "#5A3E2B",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Keep extra utility styles from borders.tsx for compatibility
  blockedUserCard: {
    backgroundColor: "#FFF5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#FECACA",
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
    marginRight: 8,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: "#5A3E2B",
  },

  statusContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: "#E0D6C9",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F9F5F0",
  },
  activeStatusButton: {
    backgroundColor: "#C6F6D5",
    borderColor: "#34D399",
  },
  blockedStatusButton: {
    backgroundColor: "#FECACA",
    borderColor: "#F87171",
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5A3E2B",
  },
  activeStatusButtonText: {
    color: "#065F46",
  },
  blockedStatusButtonText: {
    color: "#B91C1C",
  },

  buttonGroup: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  promoteButton: {
    backgroundColor: "#3B82F6",
  },
  demoteButton: {
    backgroundColor: "#FF8C42",
  },
  roleButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#8B4513",
    textAlign: "center",
  },
  successIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
