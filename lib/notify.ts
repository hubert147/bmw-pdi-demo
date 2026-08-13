"use client";

const FLAG = "prepflow-notify-on";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationsEnabled(): boolean {
  try {
    return (
      notificationsSupported() &&
      Notification.permission === "granted" &&
      localStorage.getItem(FLAG) === "1"
    );
  } catch {
    return false;
  }
}

export async function enableNotifications(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return false;
  try {
    localStorage.setItem(FLAG, "1");
  } catch {
    /* ignore */
  }
  return true;
}

export function disableNotifications(): void {
  try {
    localStorage.setItem(FLAG, "0");
  } catch {
    /* ignore */
  }
}

/** show a local notification via the service worker (survives tab-in-background) */
export async function notify(title: string, body: string): Promise<void> {
  if (!notificationsEnabled()) return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      });
    } else {
      new Notification(title, { body, icon: "/icon-192.png" });
    }
  } catch {
    /* notifications are best-effort in the demo */
  }
}
