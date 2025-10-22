import { auth, db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { get, ref } from "firebase/database";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Login Failed", "Please enter both email and password.");
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert("Login Failed", "Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const snapshot = await get(ref(db, "users/" + user.uid));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserData(data);

        if (data.role === "admin") {
          // Show modal for admin to choose role
          setShowRoleModal(true);
        } else if (data.role === "user") {
          router.replace("/user/(tabs)");
        } else {
          Alert.alert("Login Failed", "Unknown user role.");
        }
      } else {
        Alert.alert("Login Failed", "User data not found.");
        auth.signOut();
      }
    } catch (error: any) {
      Alert.alert("Login Failed", "Wrong email or password. Please try again.");
      auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role: string) => {
    setShowRoleModal(false);
    if (role === "admin") {
      router.replace("/admin/(tabs)");
    } else {
      router.replace("/user/(tabs)");
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
          {/* App Icon/Logo Placeholder */}
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
            <Text style={styles.appSubtitle}>Make Easy Your Meal Management</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#A9A9A9"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  placeholderTextColor="#A9A9A9"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Ionicons
                    name={passwordVisible ? "eye" : "eye-off"}
                    size={22}
                    color="#8B4513"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowForgotModal(true)}>
              <Text
                style={[
                  styles.link,
                  { marginBottom: 10, textDecorationLine: "underline" },
                ]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace("/auth/signup")}>
              <Text style={styles.link}>
                Don't have an account?{" "}
                <Text style={styles.linkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Role Selection Modal for Admin */}
          <Modal
            visible={showRoleModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowRoleModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Login Mode</Text>
                <Text style={styles.modalText}>
                  You have admin privileges. How would you like to login?
                </Text>

                <TouchableOpacity
                  style={[styles.roleButton, styles.adminButton]}
                  onPress={() => handleRoleSelection("admin")}
                >
                  <Text style={styles.roleButtonText}>Login as Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, styles.userButton]}
                  onPress={() => handleRoleSelection("user")}
                >
                  <Text style={styles.roleButtonText}>Login as User</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() =>{
                    setShowRoleModal(false);
                    auth.signOut();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showForgotModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowForgotModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Text style={styles.modalText}>
                  Enter your email to receive a password reset link.
                </Text>
                <TextInput
                  placeholder="Email address"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#A9A9A9"
                />
                <TouchableOpacity
                  style={[styles.roleButton, styles.adminButton]}
                  onPress={async () => {
                    Keyboard.dismiss();
                    if (!resetEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                      Alert.alert("Validation Error", "Enter a valid email.");
                      return;
                    }
                    if (!resetEmail) {
                      Alert.alert("Validation Error", "Email is required.");
                      return;
                    }

                    try {
                      await sendPasswordResetEmail(auth, resetEmail);
                      Alert.alert(
                        "Success",
                        "Reset email sent. Check your inbox."
                      );
                      setShowForgotModal(false);
                      setResetEmail("");
                    } catch (error: any) {
                      Alert.alert("Error", "Failed to send reset email.");
                    }
                  }}
                >
                  <Text style={styles.roleButtonText}>Send Reset Link</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowForgotModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: "#FF8C42", // Orange
    borderRadius: 50,
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
  passwordWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 18,
  },

  egg: {
    width: 60,
    height: 70,
    backgroundColor: "#FDF6E3", // Egg white
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  yolk: {
    width: 30,
    height: 30,
    backgroundColor: "#FFB347", // Egg yolk
    borderRadius: 15,
  },
  utensils: {
    position: "absolute",
    bottom: -10,
    flexDirection: "row",
  },
  spoon: {
    width: 4,
    height: 20,
    backgroundColor: "#8B4513", // Brown
    borderRadius: 2,
    transform: [{ rotate: "-20deg" }],
    marginRight: 15,
  },
  fork: {
    width: 4,
    height: 20,
    backgroundColor: "#8B4513", // Brown
    borderRadius: 2,
    transform: [{ rotate: "20deg" }],
  },
  appTitle: {
    fontSize: 28,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF8C42", // Orange
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#8B4513", // Brown
    marginBottom: 25,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
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
    minWidth: 250,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: "#FF8C42", // Orange
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF8C42", // Orange
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#8B4513", // Brown
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  roleButton: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  adminButton: {
    backgroundColor: "#FF8C42", // Orange
  },
  userButton: {
    backgroundColor: "#8B4513", // Brown
  },
  roleButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#8B4513", // Brown
    fontSize: 16,
  },
});
