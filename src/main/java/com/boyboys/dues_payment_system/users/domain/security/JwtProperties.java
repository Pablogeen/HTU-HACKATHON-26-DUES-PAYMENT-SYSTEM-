package com.boyboys.dues_payment_system.users.domain.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
@Component
public class JwtProperties {

    private String secret;
    private String algorithm;
    private String issuer;
    private long accessTokenExpiry;
}
