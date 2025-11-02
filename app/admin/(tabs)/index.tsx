import DepositComponent from "@/app/components/Deposite";
import MealCountSummary from "@/app/components/MealCountSummary";
import MealDeadlineEditor from "@/app/components/MealDeadLineEditor";
import MealPriceEditor from "@/app/components/MealPriceEditor";
import NoticePublisher from "@/app/components/NoticePublisher";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Manager</Text>
        <Text style={styles.headerSubtitle}>Admin Dashboard</Text>
      </View>
      <MealCountSummary />
      <DepositComponent />
      <MealDeadlineEditor />
      <NoticePublisher />
      <MealPriceEditor role="admin" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0", // Off-white/cream background
    paddingBottom: 20,
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
});
