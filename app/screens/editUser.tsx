import { db } from "@/firebaseConfig";
import { router, useLocalSearchParams } from "expo-router";
import { onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

export default function EditUser() {
  const { uid, moderator } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(0);
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("active");

  const validateInputs = () => {
    if (!name.trim()) return "Name is required.";
    if (!room.trim() || isNaN(Number(room)))
      return "Valid Room No is required.";
    if (!phone.match(/^\d{11}$/)) return "Phone number must be 11 digits.";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Invalid email format.";
    return null;
  };

  useEffect(() => {
    const userRef = ref(db, "users/" + uid);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setName(data.name || "");
        setRoom(data.room || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setBalance(data.balance || 0);
        setRole(data.role || "user");
        setStatus(data.status || "active");
      }
      setIsLoading(false);
    });
  }, [uid]);

  const handleUpdate = () => {
    const errorMessage = validateInputs();
    if (errorMessage) {
      Alert.alert("Validation Error", errorMessage);
      return;
    }
    
    Alert.alert(
      "Confirm Update",
      "Are you sure you want to update this user's information?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Update", 
          onPress: () => {
            update(ref(db, "users/" + uid), {
              name,
              room,
              phone,
              email,
              balance,
              role,
              status,
            });
            Alert.alert("Success", "User information updated successfully!");
            router.back();
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit User Profile</Text>
            <Text style={styles.headerSubtitle}>Update user information</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#A9A9A9"
              />
            </View>

            {moderator === "admin" && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Room Number</Text>
                <TextInput 
                  style={styles.input} 
                  value={room} 
                  onChangeText={setRoom}
                  placeholder="Enter room number"
                  placeholderTextColor="#A9A9A9"
                  keyboardType="numeric"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter 11-digit phone number"
                placeholderTextColor="#A9A9A9"
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.updateButtonText}>Update User</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
    fontSize: 24,
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
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513", // Brown
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0D6C9",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0D6C9",
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  actionsContainer: {
    marginTop: 10,
  },
  updateButton: {
    backgroundColor: "#FF8C42", // Orange
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  updateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8B4513", // Brown
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    color: "#8B4513", // Brown
    fontSize: 16,
    fontWeight: "bold",
  },
});