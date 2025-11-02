import { db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { get, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MealCountSummary() {
  const [counts, setCounts] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [prices, setPrices] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [loading, setLoading] = useState(false);

  const usersRef = ref(db, "users");

  const getMealDate = () => {
    const now = new Date();
    if (now.getHours() < 2) {
      now.setDate(now.getDate() - 1);
    }
    return now.toISOString().split("T")[0];
  };

  const mealDate = getMealDate();

  const fetchMealCounts = async () => {
    setLoading(true);
    const snapshot = await get(usersRef);
    let breakfast = 0;
    let lunch = 0;
    let dinner = 0;

    if (snapshot.exists()) {
      const users = snapshot.val();
      for (const uid in users) {
        const meals = users[uid]?.meals?.[mealDate];
        if (meals) {
          if (meals.breakfast) breakfast++;
          if (meals.lunch) lunch++;
          if (meals.dinner) dinner++;
        }
      }
    }
    setCounts({ breakfast, lunch, dinner });
    setLoading(false);
  };

  const fetchMealPrices = async () => {
    const priceRef = ref(db, "mealPrices");
    const snapshot = await get(priceRef);
    if (snapshot.exists()) {
      setPrices(snapshot.val());
    }
  };

  useEffect(() => {
    fetchMealCounts();
    fetchMealPrices();
  }, []);

  const totalBreakfastCost = counts.breakfast * prices.breakfast;
  const totalLunchCost = counts.lunch * prices.lunch;
  const totalDinnerCost = counts.dinner * prices.dinner;
  const grandTotal = totalBreakfastCost + totalLunchCost + totalDinnerCost;

  interface MealRowProps {
    icon: string;
    mealType: string;
    count: number;
    price: number;
    total: number;
  }

  const MealRow: React.FC<MealRowProps> = ({
    icon,
    mealType,
    count,
    price,
    total,
  }) => (
    <View style={styles.mealRow}>
      <View style={styles.mealInfo}>
        <Text style={styles.mealIcon}>{icon}</Text>
        <Text style={styles.mealLabel}>
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </Text>
      </View>

      <View style={styles.mealDetails}>
        <Text style={styles.mealCount}>{count}</Text>
        <Text style={styles.multiplier}>×</Text>
        <Text style={styles.mealPrice}>৳{price}</Text>
        <Text style={styles.equals}>=</Text>
        <Text style={styles.mealTotal}>৳{total}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Meal Count Summary</Text>
        <TouchableOpacity
          onPress={() => {
            fetchMealCounts();
            fetchMealPrices();
          }}
          style={styles.refreshButton}
          disabled={loading}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={loading ? "#ccc" : "#0d6efd"}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.dateText}>
        For{" "}
        {new Date(new Date(mealDate).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
      </Text>

      <View style={styles.content}>
        <MealRow
          icon="🍳"
          mealType="breakfast"
          count={counts.breakfast}
          price={prices.breakfast}
          total={totalBreakfastCost}
        />

        <MealRow
          icon="🍛"
          mealType="lunch"
          count={counts.lunch}
          price={prices.lunch}
          total={totalLunchCost}
        />

        <MealRow
          icon="🍲"
          mealType="dinner"
          count={counts.dinner}
          price={prices.dinner}
          total={totalDinnerCost}
        />

        <View style={styles.divider} />

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>৳{grandTotal}</Text>
        </View>
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
  refreshButton: {
    padding: 4,
  },
  dateText: {
    paddingHorizontal: 16,
    paddingTop: 8,
    color: "#6c757d",
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  mealInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mealIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  mealLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
  },
  mealDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealCount: {
    fontWeight: "600",
    color: "#212529",
    minWidth: 20,
    textAlign: "right",
  },
  multiplier: {
    marginHorizontal: 4,
    color: "#6c757d",
  },
  mealPrice: {
    fontWeight: "500",
    color: "#495057",
    minWidth: 30,
    textAlign: "right",
  },
  equals: {
    marginHorizontal: 4,
    color: "#6c757d",
  },
  mealTotal: {
    fontWeight: "600",
    color: "#5A3E2B",
    minWidth: 40,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 8,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#e7f4ff",
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5A3E2B",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5A3E2B",
  },
});
