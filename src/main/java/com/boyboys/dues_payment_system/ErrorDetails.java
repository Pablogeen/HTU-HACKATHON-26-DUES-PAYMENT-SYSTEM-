package com.boyboys.dues_payment_system;

import java.time.LocalDateTime;

public record ErrorDetails(String errorCode, String message, String details, LocalDateTime timeStamp) {}
