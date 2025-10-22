import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
    })();

    // Configure how notifications behave
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      })
    });
  }, []);

  // ✅ Return success/failure boolean
  const scheduleLocalNotification = async (title: string, body: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null, // immediate
      });
      console.log("✅ Notification scheduled:", title, body);
      return true;
    } catch (error) {
      console.error("❌ Failed to schedule notification:", error);
      return false;
    }
  };

  return { permissionStatus, scheduleLocalNotification };
}
