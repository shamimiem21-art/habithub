export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.requestPermission();
  }
  return Promise.resolve("denied");
}

export function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });
  }
}
