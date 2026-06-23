package com.boyboys.dues_payment_system.student.domain.security;


import com.boyboys.dues_payment_system.student.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class JwtHelper {


    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final JwtProperties jwtProperties;



    public JwtToken generateToken(Student student) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(jwtProperties.getAccessTokenExpiry());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .claim("issuer", jwtProperties.getIssuer())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(student.getEmail())
                .claim("user_id", student.getId())
                .claim("role", student.getRole().name())
                .build();
        var token = this.encoder.encode(
                JwtEncoderParameters.from(
                        JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new JwtToken(token, expiresAt);
    }

    public String extractUsername(String token) {
        try {
            var jwt = decoder.decode(token);
            return jwt.getSubject();
        } catch (JwtException e) {
            return null;
        }
    }

    public String extractRole(String token) {
        try {
            var jwt = decoder.decode(token);
            return jwt.getClaim("role");  // ← reads role claim from JWT
        } catch (JwtException e) {
            return null;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            var jwt = decoder.decode(token);
            String username = jwt.getSubject();
            Instant expiresAt = jwt.getExpiresAt();
            return username.equals(userDetails.getUsername()) &&
                    expiresAt != null &&
                    expiresAt.isAfter(Instant.now());
        } catch (JwtException e) {
            return false;
        }
    }

}
