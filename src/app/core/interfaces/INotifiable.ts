/**
 * Interface contract for entities capable of receiving notifications
 */
export interface INotifiable {
  getId(): number | string;
  receiveNotification(message: string, type: string): void;
  getUnreadCount(): number;
}
