import { auth, db } from "@/firebaseConfig";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useState } from "react";
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

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    if (!name.trim()) return "Name is required.";
    if (!room.trim() || isNaN(Number(room)))
      return "Valid Room No is required.";
    if (!phone.match(/^\d{11}$/)) return "Phone number must be 11 digits.";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Invalid email format.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSignup = async () => {
    const errorMessage = validateInputs();
    if (errorMessage) {
      Alert.alert("Validation Error", errorMessage);
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await set(ref(db, "users/" + user.uid), {
        name,
        room,
        phone,
        email,
        balance: 0,
        totmeals: 0,
        role: "user",
        status: "active",
      });
      Alert.alert("Success", "Account created successfully!");
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <View style={styles.egg}>
                <View style={styles.yolk}></View>
              </View>
              <View style={styles.utensils}>
                <View style={styles.spoon}></View>
                <View style={styles.fork}></View>
              </View>
            </View>
            <Text style={styles.appTitle}>Meal Manager</Text>
            <Text style={styles.appSubtitle}>Create your account</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Join Us!</Text>
            <Text style={styles.subtitle}>Fill in your details to get started</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="#A9A9A9"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Room No</Text>
              <TextInput
                placeholder="Enter your room number"
                placeholderTextColor="#A9A9A9"
                value={room}
                onChangeText={setRoom}
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone No</Text>
              <TextInput
                placeholder="Enter your 11-digit phone number"
                placeholderTextColor="#A9A9A9"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Enter your email address"
                placeholderTextColor="#A9A9A9"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="Password (min. 6 characters)"
                placeholderTextColor="#A9A9A9"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                placeholder="Re-enter your password"
                placeholderTextColor="#A9A9A9"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/auth/login")}>
              <Text style={styles.link}>
                Already have an account? <Text style={styles.linkBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF8F0", // Off-white/cream background
    padding: 20,
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: "#FF8C42", // Orange
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  egg: {
    width: 50,
    height: 55,
    backgroundColor: "#FDF6E3", // Egg white
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  yolk: {
    width: 25,
    height: 25,
    backgroundColor: "#FFB347", // Egg yolk
    borderRadius: 12.5,
  },
  utensils: {
    position: "absolute",
    bottom: -8,
    flexDirection: "row",
  },
  spoon: {
    width: 3,
    height: 16,
    backgroundColor: "#8B4513", // Brown
    borderRadius: 2,
    transform: [{ rotate: "-20deg" }],
    marginRight: 12,
  },
  fork: {
    width: 3,
    height: 16,
    backgroundColor: "#8B4513", // Brown
    borderRadius: 2,
    transform: [{ rotate: "20deg" }],
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF8C42", // Orange
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#8B4513", // Brown
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF8C42", // Orange
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#8B4513", // Brown
    marginBottom: 25,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#8B4513", // Brown
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
  signupButton: {
    backgroundColor: "#FF8C42", // Orange
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  signupButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    color: "#8B4513", // Brown
    fontSize: 16,
  },
  linkBold: {
    fontWeight: "bold",
    color: "#FF8C42", // Orange
  },
});