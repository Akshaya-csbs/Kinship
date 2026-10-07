package com.kinship.app.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/** Helpers for the comma separated list columns (talents, achievements). */
public final class TextUtil {
    private TextUtil() {}

    public static List<String> splitList(String csv) {
        if (csv == null || csv.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(csv.split("\\s*,\\s*"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public static String joinList(List<String> values) {
        return values == null ? "" : String.join(", ", values);
    }

    public static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
