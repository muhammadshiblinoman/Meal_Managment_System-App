import { db } from "@/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import { get, ref, runTransaction } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DepositComponent() {
  const [users, setUsers] = useState<{ uid: string; name: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await get(ref(db, "users"));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data).map(([uid, value]: any) => ({
          uid,
          name: value.name,
        }));
        setUsers(list);
      }
    };

    fetchUsers();
  }, []);

  const handleDeposit = async () => {
    if (!selectedUser || !amount) {
      Alert.alert("Error", "Please select a user and enter amount");
      return;
    }
    
    const depositAmount = Number(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    const userRef = ref(db, `users/${selectedUser}`);
    const depositTimestamp = Date.now();
    const depositDate = new Date().toISOString();

    try {
      await runTransaction(userRef, (userData: any) => {
        if (!userData) return;

        const currentBalance = userData.balance || 0;
        const newBalance = currentBalance + depositAmount;

        // Update balance
        userData.balance = newBalance;

        // Add deposit log entry
        userData.deposits = {
          ...(userData.deposits || {}),
          [depositTimestamp]: {
            amount: depositAmount,
            date: depositDate,
          },
        };

        return userData;
      });

      setSuccess(true);
      setAmount("");
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }

    setLoading(false);
  };

  const selectedUserName = users.find(user => user.uid === selectedUser)?.name || "";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Add Deposit</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Select Border</Text>
        <View style={styles.dropdownWrapper}>
          <Picker
            selectedValue={selectedUser}
            onValueChange={(itemValue) => setSelectedUser(itemValue)}
            style={styles.picker}
            dropdownIconColor="#6c757d"
          >
            <Picker.Item label="-- Select User --" value="" />
            {users.map((user) => (
              <Picker.Item key={user.uid} label={user.name} value={user.uid} />
            ))}
          </Picker>
        </View>

        {selectedUser && (
          <View style={styles.selectedUserContainer}>
            <Text style={styles.selectedUserText}>
              Selected: {selectedUserName}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Amount (৳)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholderTextColor="#6c757d"
        />

        <TouchableOpacity
          style={[styles.depositButton, (loading || success) && styles.depositButtonDisabled]}
          onPress={handleDeposit}
          disabled={loading || success}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : success ? (
            <View style={styles.successContent}>
              <Text style={styles.depositButtonText}>Deposit Successful!</Text>
              <Text style={styles.successIcon}>✓</Text>
            </View>
          ) : (
            <Text style={styles.depositButtonText}>Process Deposit</Text>
          )}
        </TouchableOpacity>

        {selectedUser && amount && !isNaN(Number(amount)) && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>
              {selectedUserName} will receive ৳{Number(amount).toLocaleString()}
            </Text>
          </View>
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
  content: {
    padding: 20,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
    color: "#495057",
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#212529",
  },
  selectedUserContainer: {
    backgroundColor: "#e7f4ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedUserText: {
    color: "#0a58ca",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    color: "#212529",
    backgroundColor: "#fff",
  },
  depositButton: {
    backgroundColor: "#5A3E2B",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  depositButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  depositButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  previewContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#d1e7dd",
    borderRadius: 8,
  },
  previewText: {
    color: "#0f5132",
    fontWeight: "500",
    textAlign: "center",
  },
});