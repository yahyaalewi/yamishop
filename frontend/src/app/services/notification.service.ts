import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  message: string;
  type: NotificationType;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<Notification[]>([]);
  confirmationRequest = signal<{ message: string, resolve: (val: boolean) => void } | null>(null);
  private nextId = 0;

  show(message: string, type: NotificationType = 'success') {
    const id = this.nextId++;
    const notification: Notification = { message, type, id };
    
    this.notifications.update(prev => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  confirm(message: string): Promise<boolean> {
    return new Promise(resolve => {
      this.confirmationRequest.set({ message, resolve });
    });
  }

  resolveConfirmation(val: boolean) {
    const request = this.confirmationRequest();
    if (request) {
      request.resolve(val);
      this.confirmationRequest.set(null);
    }
  }

  remove(id: number) {
    this.notifications.update(prev => prev.filter(n => n.id !== id));
  }
}
