package com.kinship.app.models;

import com.kinship.app.interfaces.JsonSerializable;
import com.kinship.app.util.TimeUtil;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

/**
 * OOP: ABSTRACTION + ENCAPSULATION.
 * Root of every persisted object. The id is assigned by MySQL (AUTO_INCREMENT)
 * and can only be set once.
 */
public abstract class AbstractEntity implements JsonSerializable {
    private long id;
    private final LocalDateTime createdAt;

    protected AbstractEntity(long id, LocalDateTime createdAt) {
        this.id = id;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public long getId() {
        return id;
    }

    /** Called by a repository after INSERT returns the generated key. */
    public void assignId(long generatedId) {
        if (this.id != 0) {
            throw new IllegalStateException(getClass().getSimpleName() + " already has id " + id);
        }
        this.id = generatedId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /** Polymorphic one-line description, overridden by every concrete class. */
    public abstract String getDisplaySummary();

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("id", id);
        json.put("createdAt", createdAt.toString());
        json.put("timestamp", TimeUtil.timeAgo(createdAt));
        return json;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return id != 0 && id == ((AbstractEntity) o).id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(getClass(), id);
    }

    @Override
    public String toString() {
        return getDisplaySummary();
    }
}
