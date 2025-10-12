import { db } from "@/firebaseConfig";
import { getAuth } from "firebase/auth";
import { get, ref } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Fixed date generation function
const getCurrentMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dates: string[] = [];

  // Get the first day of the month
  const firstDay = new Date(year, month, 1);
  // Get the last day of the month
  const lastDay = new Date(year, month + 1, 0);

  // Generate dates for the entire month
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split("T")[0];
    dates.push(dateString);
  }

  return dates;
};

export default function MyMeals() {
  const [meals, setMeals] = useState<Record<string, any>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dates, setDates] = useState<string[]>([]);

  const fetchData = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const mealRef = ref(db, `users/${user.uid}/meals`);
      const snapshot = await get(mealRef);
      if (snapshot.exists()) {
        setMeals(snapshot.val());
      } else {
        setMeals({});
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set dates on component mount
    setDates(getCurrentMonthDates());
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const totalCost = dates.reduce((sum, date) => {
    const meal = meals[date];
    return sum + (meal?.totalExpense ? Number(meal.totalExpense) : 0);
  }, 0);

  // Count total meals for the month
  const totalMeals = dates.reduce((count, date) => {
    const meal = meals[date] || {};
    return (
      count +
      (meal.breakfast ? 1 : 0) +
      (meal.lunch ? 1 : 0) +
      (meal.dinner ? 1 : 0)
    );
  }, 0);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Loading your meals...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF8C42"]}
            tintColor="#FF8C42"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Meals</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.costCard]}>
            <Text style={styles.summaryLabel}>Total Cost</Text>
            <Text style={styles.summaryValue}>৳{totalCost.toFixed(2)}</Text>
          </View>

          <View style={[styles.summaryCard, styles.mealsCard]}>
            <Text style={styles.summaryLabel}>Total Meals</Text>
            <Text style={styles.summaryValue}>{totalMeals}</Text>
          </View>
        </View>

        {/* Meal List */}
        <View style={styles.mealListContainer}>
          <Text style={styles.sectionTitle}>Daily Meal Records</Text>

          {dates.length > 0 ? (
            dates
              .filter((date) => meals[date])
              .map((date) => {
                const meal = meals[date];
                const dayCost = meal?.totalExpense
                  ? Number(meal.totalExpense)
                  : 0;

                return (
                  <View key={date} style={styles.mealCard}>
                    <View style={styles.dateContainer}>
                      <Text style={styles.dateText}>
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "numeric",
                        })}
                      </Text>
                      <Text style={styles.fullDateText}>{date}</Text>
                    </View>

                    <View style={styles.mealsContainer}>
                      <View style={styles.mealItem}>
                        <Text style={styles.mealIcon}>🍳</Text>
                        <Text
                          style={
                            meal.breakfast
                              ? styles.mealPresent
                              : styles.mealAbsent
                          }
                        >
                          {meal.breakfast ? "Taken" : "Not taken"}
                        </Text>
                      </View>

                      <View style={styles.mealItem}>
                        <Text style={styles.mealIcon}>🍛</Text>
                        <Text
                          style={
                            meal.lunch ? styles.mealPresent : styles.mealAbsent
                          }
                        >
                          {meal.lunch ? "Taken" : "Not taken"}
                        </Text>
                      </View>

                      <View style={styles.mealItem}>
                        <Text style={styles.mealIcon}>🍲</Text>
                        <Text
                          style={
                            meal.dinner ? styles.mealPresent : styles.mealAbsent
                          }
                        >
                          {meal.dinner ? "Taken" : "Not taken"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.costContainer}>
                      <Text style={styles.costText}>৳{dayCost.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>
                No meal records found for this month
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: "#FF8C42",
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
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
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: "center",
  },
  costCard: {
    backgroundColor: "#FFE3B8",
  },
  mealsCard: {
    backgroundColor: "#F5E9DB",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 8,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
  },
  mealListContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 16,
    paddingLeft: 8,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#e9ecef",
    borderWidth: 2,
  },
  dateContainer: {
    width: 70,
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 4,
  },
  fullDateText: {
    fontSize: 12,
    color: "#A9A9A9",
  },
  mealsContainer: {
    flex: 1,
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  mealIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 24,
  },
  mealPresent: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
  mealAbsent: {
    fontSize: 14,
    color: "#D32F2F",
    fontWeight: "500",
  },
  costContainer: {
    marginLeft: 12,
  },
  costText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF8C42",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#8B4513",
    textAlign: "center",
  },
});
