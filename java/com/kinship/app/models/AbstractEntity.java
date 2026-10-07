package com.kinship.app.models;

import java.time.LocalDateTime;

/**
 * Java OOP Concept: ABSTRACTION & ENCAPSULATION
 * Abstract base class for all domain entities.
 */
public abstract class AbstractEntity {
    private final long id;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AbstractEntity(long id) {
        this.id = id;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public long getId() {
        return id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    protected void markUpdated() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Abstract method enforcing Polymorphism across all domain entities.
     */
    public abstract String getDisplaySummary();
}
