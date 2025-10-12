import { db } from "@/firebaseConfig";
import { router } from "expo-router";
import { onValue, ref, remove, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function Borders() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, "users/");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const userList = data
        ? Object.entries(data).map(([uid, user]) => ({
            uid,
            ...(user as object),
          }))
        : [];
      setUsers(userList as any);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (uid: any, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            remove(ref(db, "users/" + uid));
          },
        },
      ]
    );
  };

  const updateStatus = (uid: string, newStatus: "active" | "blocked", name: string) => {
    const userRef = ref(db, "users/" + uid + "/status");
    
    if (newStatus === "blocked") {
      Alert.alert("Block User?", `Are you sure you want to block ${name}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Block",
          onPress: () => {
            set(userRef, newStatus);
          },
        },
      ]);
    } else {
      set(userRef, newStatus);
    }
  };

  const promoteToAdmin = (uid: string, name: string, currentRole: string) => {
    const userRef = ref(db, "users/" + uid + "/role");
    const newRole = currentRole === "admin" ? "user" : "admin";
    const action = newRole === "admin" ? "promote" : "demote";
    
    Alert.alert(
      `Confirm ${action === "promote" ? "Promotion" : "Demotion"}`,
      `Are you sure you want to ${action} ${name} to ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: `Yes, ${action}`,
          onPress: () => {
            set(userRef, newRole);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/screens/editUser",
          params: {
            uid: item.uid,
            moderator: "admin"
          },
        })
      }
      style={[
        styles.userCard,
        item.status === "blocked" && styles.blockedUserCard
      ]}
    >
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.role === "admin" && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          )}
          {item.status === "blocked" && (
            <View style={styles.blockedBadge}>
              <Text style={styles.blockedBadgeText}>BLOCKED</Text>
            </View>
          )}
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📧</Text>
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📞</Text>
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🏠</Text>
          <Text style={styles.detailText}>Room No : {item.room}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>💰</Text>
          <Text style={styles.detailText}>৳ {item.balance || 0}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === "active" && styles.activeStatusButton,
            ]}
            onPress={() => updateStatus(item.uid, "active", item.name)}
          >
            <Text style={[
              styles.statusButtonText,
              item.status === "active" && styles.activeStatusButtonText
            ]}>
              ✅ Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === "blocked" && styles.blockedStatusButton,
            ]}
            onPress={() => updateStatus(item.uid, "blocked", item.name)}
          >
            <Text style={[
              styles.statusButtonText,
              item.status === "blocked" && styles.blockedStatusButtonText
            ]}>
              ⛔ Blocked
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            item.role === "admin" ? styles.demoteButton : styles.promoteButton
          ]}
          onPress={() => promoteToAdmin(item.uid, item.name, item.role)}
        >
          <Text style={styles.roleButtonText}>
            {item.role === "admin" ? "Demote" : "Promote"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.uid, item.name)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>Manage all users in the system</Text>
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
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
  blockedBadge: {
    backgroundColor: "#FECACA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  blockedBadgeText: {
    color: "#DC2626",
    fontSize: 10,
    fontWeight: "bold",
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
  editButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  editButtonText: {
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
});