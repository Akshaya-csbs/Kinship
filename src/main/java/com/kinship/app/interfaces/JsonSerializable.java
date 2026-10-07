package com.kinship.app.interfaces;

import java.util.Map;

/**
 * Every model converts itself to a JSON-ready map; subclasses override and extend it (polymorphism).
 */
public interface JsonSerializable {
    Map<String, Object> toJson();
}
