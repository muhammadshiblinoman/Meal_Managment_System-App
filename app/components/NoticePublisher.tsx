import { db } from "@/firebaseConfig";
import { onValue, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Switch,
  Text,
  TextInput,
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
    setLoading(true);
    try {
      await set(ref(db, "notice"), {
        text,
        published,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.box}>
      <Text style={styles.heading}>📢 Post a Notice</Text>
      <TextInput
        style={styles.input}
        placeholder="Write notice..."
        multiline
        value={text}
        onChangeText={setText}
      />
      <View style={styles.switchRow}>
        <Text>Publish</Text>
        <Switch value={published} onValueChange={setPublished} />
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#007bff" />
      ) : (
        <Button title="Save Notice" onPress={handleSave} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    minHeight: 60,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});
