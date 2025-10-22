import { db } from "@/firebaseConfig";
import { getAuth } from "firebase/auth";
import { get, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface DepositEntry {
  amount: number;
  date: string;
  timestamp?: number;
}

export default function MyDeposits() {
  const [deposits, setDeposits] = useState<DepositEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchDeposits = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const snapshot = await get(ref(db, `users/${user.uid}/deposits`));

      if (!snapshot.exists()) {
        setDeposits([]);
        setTotal(0);
        return;
      }

      const data = snapshot.val();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Convert object to array and include timestamp as key
      const depositsArray: DepositEntry[] = [];

      for (const [timestamp, depositData] of Object.entries(data)) {
        const deposit = depositData as DepositEntry;
        depositsArray.push({
          ...deposit,
          timestamp: Number(timestamp),
        });
      }

      // Filter deposits for current month and year
      const filtered: DepositEntry[] = depositsArray.filter(
        (entry: DepositEntry) => {
          if (!entry.date) return false;

          const date = new Date(entry.date);
          return (
            date.getFullYear() === currentYear &&
            date.getMonth() === currentMonth
          );
        }
      );

      // Sort by latest first (using timestamp if available, otherwise date)
      filtered.sort((a, b) => {
        const dateA = a.timestamp ? a.timestamp : new Date(a.date).getTime();
        const dateB = b.timestamp ? b.timestamp : new Date(b.date).getTime();
        return dateB - dateA;
      });

      setDeposits(filtered);

      // Calculate total
      const depositTotal = filtered.reduce(
        (sum, d) => sum + Number(d.amount || 0),
        0
      );
      setTotal(depositTotal);
    } catch (error) {
      console.error("Error fetching deposits:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeposits();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Loading your deposits...</Text>
      </View>
    );
  }

  return (
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
          <Text style={styles.headerTitle}>My Deposits</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Deposited This Month</Text>
          <Text style={styles.summaryAmount}>৳{total.toFixed(2)}</Text>
        </View>

        {/* Deposits List */}
        <View style={styles.depositsContainer}>
          <Text style={styles.sectionTitle}>Deposit History</Text>

          {deposits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyText}>No deposits this month</Text>
              <Text style={styles.emptySubtext}>
                Your deposits for this month will appear here
              </Text>
            </View>
          ) : (
            deposits.map((deposit, index) => (
              <View key={index} style={styles.depositCard}>
                <View style={styles.depositInfo}>
                  <Text style={styles.depositDate}>
                    {new Date(deposit.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.depositTime}>
                    {new Date(deposit.date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Text style={styles.depositAmount}>
                  + ৳{deposit.amount.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  summaryCard: {
    backgroundColor: "#FFE3B8",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#8B4513",
    marginBottom: 8,
    fontWeight: "600",
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B4513",
  },
  depositsContainer: {
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8B4513",
    textAlign: "center",
  },
  depositCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  depositInfo: {
    flex: 1,
  },
  depositDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5A3E2B",
    marginBottom: 4,
  },
  depositTime: {
    fontSize: 14,
    color: "#8B4513",
    opacity: 0.7,
  },
  depositAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
});
