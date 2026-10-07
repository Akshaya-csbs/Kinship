package com.kinship.app.interfaces;

/**
 * Java Interface contract for notifiable entities.
 */
public interface INotifiable {
    long getId();
    void receiveNotification(String message, String type);
    int getUnreadCount();
}
