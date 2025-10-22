import { db } from "@/firebaseConfig";
import { onValue, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NoticePublisher() {
  const [text, setText] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const noticeRef = ref(db, "notice");
    onValue(noticeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setText(data.text || "");
        setPublished(data.published || false);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      await set(ref(db, "notice"), {
        text,
        published,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving notice:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notice Publisher</Text>
          </View>
      
      <TextInput
        style={styles.input}
        placeholder="Write notice here..."
        placeholderTextColor="#A9A9A9"
        multiline
        numberOfLines={3}
        value={text}
        onChangeText={setText}
      />
      
      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchLabel}>
            {published ? "Published" : "Draft"}
          </Text>
          <Text style={styles.switchDescription}>
            {published ? "Visible to all users" : "Only visible to admins"}
          </Text>
        </View>
        <Switch 
          value={published} 
          onValueChange={setPublished}
          thumbColor={published ? "#FF8C42" : "#f4f3f4"}
          trackColor={{ false: "#767577", true: "#FFE3B8" }}
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.saveButton, (!text.trim() || loading) && styles.saveButtonDisabled]} 
        onPress={handleSave}
        disabled={!text.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.saveButtonText}>
            {published ? "Publish Notice" : "Save Draft"}
          </Text>
        )}
      </TouchableOpacity>
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
    backgroundColor: "#FF8C42", // Orange
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0D6C9",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F9F5F0",
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: "#5A3E2B",
    opacity: 0.8,
  },
  saveButton: {
    backgroundColor: "#5A3E2B",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    margin: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});