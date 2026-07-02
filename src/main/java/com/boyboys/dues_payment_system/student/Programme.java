package com.boyboys.dues_payment_system.student;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Programme {
    ICT,
    COMPUTER_SCIENCE;

    @JsonCreator
    public static Programme fromValue(String value) {
        return Programme.valueOf(value.toUpperCase().replace(" ", "_"));
    }
}
