package com.kinship.app.http;

/** Lets a handler choose a status code other than 200. */
public record ApiResponse(int status, Object body) {
    public static ApiResponse created(Object body) {
        return new ApiResponse(201, body);
    }
}
