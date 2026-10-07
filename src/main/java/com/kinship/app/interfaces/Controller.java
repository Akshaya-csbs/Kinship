package com.kinship.app.interfaces;

import com.kinship.app.http.Router;

/**
 * Every REST controller registers its endpoints on the shared {@link Router}.
 */
public interface Controller {
    void registerRoutes(Router router);
}
