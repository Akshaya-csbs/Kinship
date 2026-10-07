package com.kinship.app.http;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public final class Json {
    /** Gson instances are thread-safe and can be shared by all worker threads. */
    public static final Gson GSON = new GsonBuilder().serializeNulls().disableHtmlEscaping().create();

    private Json() {}
}
