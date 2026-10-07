package com.kinship.app.controllers;

import com.kinship.app.exceptions.EntityNotFoundException;
import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.exceptions.ValidationException;
import com.kinship.app.interfaces.Controller;
import com.kinship.app.interfaces.JsonSerializable;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.mysql.MysqlUserRepository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Helpers shared by all controllers (OOP: abstract class + interface).
 */
public abstract class BaseController implements Controller {
    protected final MysqlUserRepository users;

    protected BaseController(MysqlUserRepository users) {
        this.users = users;
    }

    protected CreatorUser requireUser(long id) throws KinshipException {
        return users.findById(id).orElseThrow(() -> new EntityNotFoundException("User", id));
    }

    protected static List<Map<String, Object>> toJsonList(List<? extends JsonSerializable> items) {
        return items.stream().map(JsonSerializable::toJson).collect(Collectors.toList());
    }

    /** Builds a JSON object from alternating key/value arguments. */
    protected static Map<String, Object> obj(Object... keyValues) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            map.put((String) keyValues[i], keyValues[i + 1]);
        }
        return map;
    }

    protected static String optionalUrl(String url) throws ValidationException {
        if (url == null || url.isBlank()) return null;
        if (!url.matches("^https?://\\S+$") || url.length() > 2000) {
            throw new ValidationException("Image URL must start with http:// or https://");
        }
        return url;
    }
}
