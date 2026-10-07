package com.kinship.app.interfaces;

/**
 * Anything that can receive a notification.
 */
public interface INotifiable {
    long getId();

    String getDisplayName();

    /** Text shown to the recipient, personalised by the implementing class. */
    default String formatNotification(String message) {
        return "Hey " + getDisplayName() + ", " + message;
    }
}
