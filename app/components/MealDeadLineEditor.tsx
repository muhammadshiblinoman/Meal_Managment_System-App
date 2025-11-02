import { db } from "@/firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { get, ref, set } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MealDeadlineEditor() {
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // ✅ Load only time (hour, minute) from DB
  useEffect(() => {
    const loadDeadline = async () => {
      try {
        const snapshot = await get(ref(db, "/settings/mealDeadline"));
        if (snapshot.exists()) {
          const { hour, minute } = snapshot.val();
          const now = new Date();
          now.setHours(hour, minute, 0, 0); // today’s date with saved time
          setDeadline(now);
        }
      } catch (error) {
        console.error("Failed to load deadline:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeadline();
  }, []);

  // ✅ Save only hour and minute
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const timeData = {
        hour: deadline.getHours(),
        minute: deadline.getMinutes(),
      };
      await set(ref(db, "/settings/mealDeadline"), timeData);
      Alert.alert("✅ Success", "Meal selection time updated successfully.");
    } catch (error) {
      console.error("Failed to save deadline:", error);
      Alert.alert("❌ Error", "Failed to save time. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [deadline]);

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (selectedDate) setDeadline(selectedDate);
  };

  const formatTime = (date: Date) =>
    date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Loading deadline settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⏰ Meal Selection Last Time</Text>
      </View>

      <View style={{ padding: 16 }}>
        <View style={styles.deadlineContainer}>
          <Text style={styles.label}>Deadline Time:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateText}>{formatTime(deadline)}</Text>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {(showPicker || Platform.OS === "ios") && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={deadline}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
            />
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Time</Text>
          )}
        </TouchableOpacity>
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
    padding: 16,
    backgroundColor: "#FF8C42",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  icon: {
    fontSize: 28,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
  },
  description: {
    fontSize: 14,
    color: "#5A3E2B",
    lineHeight: 20,
    marginBottom: 20,
  },
  deadlineContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5A3E2B",
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: "#FFF8F0",
    borderWidth: 1,
    borderColor: "#E0D6C9",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 20,
    color: "#8B4513",
    fontWeight: "600",
  },
  editIcon: {
    fontSize: 20,
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: "#FFF8F0",
    borderRadius: 12,
    padding: 10,
  },
  doneButton: {
    backgroundColor: "#5A3E2B",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  doneButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#5A3E2B",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  saveButtonDisabled: {
    backgroundColor: "#D4A574",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  saveIcon: {
    fontSize: 18,
  },
  infoBox: {
    backgroundColor: "#E8F4F8",
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#5A3E2B",
    lineHeight: 18,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8B4513",
    textAlign: "center",
  },
});
