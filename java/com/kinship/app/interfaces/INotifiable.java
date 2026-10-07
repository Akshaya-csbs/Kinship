package com.kinship.app.interfaces;

/**
 * Java Interface contract for notifiable entities.
 */
public interface INotifiable {
    Object getId();
    void receiveNotification(String message, String type);
    int getUnreadCount();
}
