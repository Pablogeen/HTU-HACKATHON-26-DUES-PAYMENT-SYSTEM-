package com.boyboys.dues_payment_system.users.domain.service;

import com.boyboys.dues_payment_system.users.domain.ConfirmationToken;
import com.boyboys.dues_payment_system.users.domain.ConfirmationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConfirmationTokenService {

    private final ConfirmationTokenRepository tokenRepo;

    public void saveConfirmationToken(ConfirmationToken confirmToken) {
        tokenRepo.save(confirmToken);
    }

    public Optional<ConfirmationToken> getToken(String token) {
        return tokenRepo.findByToken(token);
    }

    public int setConfirmationDetails(String token) {
        return  tokenRepo.updateConfirmationDetails(token, LocalDateTime.now());
    }
}
