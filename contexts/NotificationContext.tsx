import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    ReactNode,
  } from "react";
  import * as Notifications from "expo-notifications";
  import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
  
  interface NotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    lastNotificationResponse: Notifications.NotificationResponse | null;
    error: Error | null;
  }
  
  const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
  );
  
  export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
      throw new Error(
        "useNotification must be used within a NotificationProvider"
      );
    }
    return context;
  };
  
  interface NotificationProviderProps {
    children: ReactNode;
  }
  
  export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
  }) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] =
      useState<Notifications.Notification | null>(null);
    const [lastNotificationResponse, setLastNotificationResponse] =
      useState<Notifications.NotificationResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
  
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();
  
    useEffect(() => {
      registerForPushNotificationsAsync().then(
        (token) => setExpoPushToken(token),
        (error) => setError(error)
      );
  
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("🔔 Notification Received: ", notification);
          setNotification(notification);
        });
  
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log(
            "🔔 Notification Response: ",
            JSON.stringify(response, null, 2),
            JSON.stringify(response.notification.request.content.data, null, 2)
          );
          setLastNotificationResponse(response);
        });

      const getLastNotificationResponse = async () => {
        try {
          const response = await Notifications.getLastNotificationResponseAsync();
          if (response) {
            console.log(
              "🔔 App opened from terminated state with notification: ",
              JSON.stringify(response, null, 2)
            );
            setLastNotificationResponse(response);
            handleNotificationResponse(response);
          }
        } catch (err) {
          console.error("Error getting last notification response:", err);
          setError(err as Error);
        }
      };

      getLastNotificationResponse();
  
      return () => {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(
            notificationListener.current
          );
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      };
    }, []);

    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
    };
  
    return (
      <NotificationContext.Provider
        value={{ expoPushToken, notification, lastNotificationResponse, error }}
      >
        {children}
      </NotificationContext.Provider>
    );
  };