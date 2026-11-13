export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

export const notificationService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Failed to request notification permission:', e);
      return 'denied';
    }
  },

  showNotification(options: NotificationOptions): boolean {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || './pwa-192x192.png',
        badge: options.badge || './pwa-192x192.png',
        tag: options.tag || 'planflow-reminder'
      });
      return true;
    } catch (e) {
      console.warn('Notification display failed:', e);
      return false;
    }
  }
};

