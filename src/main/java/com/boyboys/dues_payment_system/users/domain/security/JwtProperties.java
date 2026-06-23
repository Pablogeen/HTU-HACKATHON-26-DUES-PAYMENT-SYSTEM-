package com.boyboys.dues_payment_system.users.domain.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtProperties {

    private String secret;
    private String algorithm;
    private String issuer;
    private long accessTokenExpiry;
}
