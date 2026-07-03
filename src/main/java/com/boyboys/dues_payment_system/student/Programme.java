package com.boyboys.dues_payment_system.student;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Programme {
    ICT,
    COMPUTER_SCIENCE;


    @JsonCreator
    public static Programme fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Programme cannot be blank");
        }
        String normalized = value.trim()
                .toUpperCase()
                .replaceAll("[\\s-]+", "_"); // spaces or hyphens -> underscore

        for (Programme p : values()) {
            if (p.name().equals(normalized)) {
                return p;
            }
        }
        throw new IllegalArgumentException("Unknown programme: " + value);
    }

    @JsonValue
    public String toValue() {
        return name();
    }

}
