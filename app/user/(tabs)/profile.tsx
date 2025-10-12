import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfilePage from "../../screens/ProfilePage";
export default function Profile() {

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ProfilePage moderator="user"/>
    </SafeAreaView>
  );
}
