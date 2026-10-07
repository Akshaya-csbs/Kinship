package com.kinship.app.interfaces;

import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.http.ApiRequest;

/**
 * Functional interface for one REST endpoint. Implemented with lambdas / method references
 * in the controllers; the returned object is serialized to JSON.
 */
@FunctionalInterface
public interface ApiHandler {
    Object handle(ApiRequest request) throws KinshipException;
}
