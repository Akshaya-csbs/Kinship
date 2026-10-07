package com.kinship.app.util;

import java.time.Duration;
import java.time.LocalDateTime;

public final class TimeUtil {
    private TimeUtil() {}

    /** "Just now", "5m ago", "3h ago", "2d ago", "4w ago". */
    public static String timeAgo(LocalDateTime time) {
        if (time == null) {
            return "";
        }
        long seconds = Math.max(0, Duration.between(time, LocalDateTime.now()).getSeconds());
        if (seconds < 60) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        if (days < 7) return days + "d ago";
        return (days / 7) + "w ago";
    }
}
