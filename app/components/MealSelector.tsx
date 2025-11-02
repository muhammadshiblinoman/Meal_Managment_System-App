import { auth, db } from "@/firebaseConfig";
import { get, onValue, ref, runTransaction } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MealSelector() {
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState("active");
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [prices, setPrices] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [mealDate, setMealDate] = useState("");
  const [mealDeadline, setMealDeadline] = useState<{ hour: number; minute: number } | null>(null);

  // 🕒 Fetch meal deadline from Firebase
  const fetchMealDeadline = async () => {
    try {
      const deadlineRef = ref(db, "/settings/mealDeadline");
      const snapshot = await get(deadlineRef);
      if (snapshot.exists()) {
        setMealDeadline(snapshot.val());
      }
    } catch (error) {
      console.error("Failed to fetch meal deadline:", error);
    }
  };

  const getMealDate = () => {
    const now = new Date();
    const mealDate = new Date(now);
    setMealDate(mealDate.toISOString().split("T")[0]);
    mealDate.setDate(mealDate.getDate() + 1);
    return mealDate.toISOString().split("T")[0];
  };

  const fetchMealPrices = async () => {
    const priceRef = ref(db, "mealPrices");
    const snapshot = await get(priceRef);
    if (snapshot.exists()) {
      setPrices(snapshot.val());
    }
  };

  const saveMealsToDatabase = async (meals: typeof selectedMeals) => {
    const uid = auth.currentUser?.uid;
    const dateKey = getMealDate();
    const userRef = ref(db, `users/${uid}`);

    try {
      const result = await runTransaction(userRef, (userData: any) => {
        if (!userData) return;

        const currentBalance = userData.balance || 0;
        const prevMeals = userData.meals?.[dateKey] || {};

        let prevExpense = 0;
        if (prevMeals.breakfast) prevExpense += prices.breakfast || 0;
        if (prevMeals.lunch) prevExpense += prices.lunch || 0;
        if (prevMeals.dinner) prevExpense += prices.dinner || 0;

        let totalExpense = 0;
        if (meals.breakfast) totalExpense += prices.breakfast || 0;
        if (meals.lunch) totalExpense += prices.lunch || 0;
        if (meals.dinner) totalExpense += prices.dinner || 0;

        const updatedBalance = currentBalance + prevExpense - totalExpense;

        if (updatedBalance < 0) {
          Alert.alert("Insufficient Balance", "Please recharge your account.");
          return; // Cancel transaction
        }

        userData.balance = updatedBalance;
        userData.meals = {
          ...(userData.meals || {}),
          [dateKey]: {
            ...meals,
            totalExpense,
          },
        };

        return userData;
      });

      return result.committed;
    } catch (error) {
      console.error("Transaction error:", error);
      return false;
    }
  };

  // ✅ Check if current time is before deadline
  const isBeforeDeadline = (): boolean => {
    if (!mealDeadline) return true; // if not loaded yet, allow toggling

    const now = new Date();
    const deadline = new Date();
    deadline.setHours(mealDeadline.hour, mealDeadline.minute, 0, 0);

    return now.getTime() <= deadline.getTime();
  };

  const toggleMeal = (key: "breakfast" | "lunch" | "dinner") => {
    if (status === "blocked") {
      Alert.alert("You are blocked", "Contact the Manager for more information");
      return;
    }
    if (!isBeforeDeadline()) {
      Alert.alert("Time Over", "Meal selection time has expired for today.");
      return;
    }

    const updated = { ...selectedMeals, [key]: !selectedMeals[key] };
    saveMealsToDatabase(updated).then((success) => {
      if (success) {
        setSelectedMeals(updated);
      }
    });
  };

  const fetchUserData = () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    fetchMealPrices();
    fetchMealDeadline(); // ✅ also fetch deadline

    const userRef = ref(db, "users/" + uid);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUser(data);
      setStatus(data?.status || "active");
    });

    const mealRef = ref(db, `users/${uid}/meals/${getMealDate()}`);
    onValue(mealRef, (snapshot) => {
      const mealData = snapshot.val();
      if (mealData) {
        setSelectedMeals({
          breakfast: !!mealData.breakfast,
          lunch: !!mealData.lunch,
          dinner: !!mealData.dinner,
        });
      }
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Select Meals</Text>
        <TouchableOpacity 
          style={styles.balanceContainer}
          onPress={() => {
            setUser({ ...user, loading: true });
            fetchUserData();
          }}
        >
          <Text style={styles.balanceText}>
            {user?.loading ? "Loading..." : `Balance: ৳${user?.balance?.toFixed(2) || "0.00"}`}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.dateText}>
        For{" "}
        {new Date(
          new Date(mealDate).getTime() + 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>
      <View style={styles.mealSelectionBox}>
        <View style={styles.mealRow}>
          <TouchableOpacity
            style={[
              styles.mealButton,
              selectedMeals.breakfast && styles.mealButtonSelected,
            ]}
            onPress={() => toggleMeal("breakfast")}
          >
            <Text style={styles.mealButtonText}>Breakfast</Text>
            <Text style={styles.mealPriceText}>৳{prices.breakfast}</Text>
            <Text style={styles.mealIcon}>🍳</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealRow}>
          <TouchableOpacity
            style={[
              styles.mealButton,
              selectedMeals.lunch && styles.mealButtonSelected,
            ]}
            onPress={() => toggleMeal("lunch")}
          >
            <Text style={styles.mealButtonText}>Lunch</Text>
            <Text style={styles.mealPriceText}>৳{prices.lunch}</Text>
            <Text style={styles.mealIcon}>🍛</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealRow}>
          <TouchableOpacity
            style={[
              styles.mealButton,
              selectedMeals.dinner && styles.mealButtonSelected,
            ]}
            onPress={() => toggleMeal("dinner")}
          >
            <Text style={styles.mealButtonText}>Dinner</Text>
            <Text style={styles.mealPriceText}>৳{prices.dinner}</Text>
            <Text style={styles.mealIcon}>🍲</Text>
          </TouchableOpacity>
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
    margin: 16,
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
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  balanceContainer: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
  },
  mealSelectionBox: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  mealRow: {
    marginBottom: 12,
  },
  mealButton: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  mealButtonSelected: {
    backgroundColor: "#FFE3B8",
    borderColor: "#FFF9E9",
  },
  mealButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#212529",
    flex: 1,
  },
  mealPriceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginRight: 10,
  },
  mealIcon: {
    fontSize: 24,
  },
  dateText: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    color: "#6c757d",
    fontSize: 14,
  },
});