import { auth, db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type UserData = {
  name: string;
  email: string;
  phone: string;
  room: string;
  balance: number;
  totmeals: number;
  role: string;
};

export default function Details({ moderator }: { moderator?: string }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const userRef = ref(db, "users/" + currentUser.uid);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              // Clear admin login mode preference
              await AsyncStorage.removeItem('adminLoginMode');
              await signOut(auth);
              router.replace("/auth/login");
            } catch (error: any) {
              Alert.alert("Logout Failed", error.message);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile data.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.replace("/user/(tabs)")}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Details</Text>
        <Text style={styles.headerSubtitle}>My Account Information</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>{userData.name.charAt(0)}</Text>
        </View>
        
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userRole}>{userData.role.toUpperCase()}</Text>
        
        <View style={styles.divider} />
        
        {/* User Details */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Email Address</Text>
          <Text style={styles.detailValue}>{userData.email}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Phone Number</Text>
          <Text style={styles.detailValue}>{userData.phone}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Room Number</Text>
          <Text style={styles.detailValue}>{userData.room}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Account Balance</Text>
          <Text style={[styles.detailValue, styles.balanceValue]}>৳ {userData.balance.toFixed(2)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (currentUser) {
              router.push({
                pathname: "/screens/editUser",
                params: {
                  uid: currentUser.uid,
                  moderator: moderator,
                },
              });
            } else {
              Alert.alert("Error", "User not found.");
            }
          }}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0", // Off-white/cream background
  },
  contentContainer: {
    paddingBottom: 40,
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
    color: "#8B4513", // Brown
  },
  errorText: {
    fontSize: 16,
    color: "#8B4513", // Brown
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF8C42", // Orange
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
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
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF8C42", // Orange
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileIconText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513", // Brown
    marginBottom: 4,
    textAlign: "center",
  },
  userRole: {
    fontSize: 14,
    color: "#FF8C42", // Orange
    fontWeight: "600",
    marginBottom: 20,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0E6D6", // Light cream
    width: "100%",
    marginVertical: 16,
  },
  detailItem: {
    width: "100%",
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B4513", // Brown
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#5A3E2B", // Dark brown
    backgroundColor: "#F9F5F0", // Very light cream
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F0E6D6", // Light cream
  },
  balanceValue: {
    color: "#FF8C42", // Orange
    fontWeight: "600",
  },
  actionsContainer: {
    paddingHorizontal: 16,
  },
  editButton: {
    backgroundColor: "#FF8C42", // Orange
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DC2626", // Red
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: "#DC2626", // Red
    fontSize: 16,
    fontWeight: "bold",
  },
});