package com.boyboys.dues_payment_system.users.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ConfirmationTokenRepository extends JpaRepository<ConfirmationToken, Long> {

    Optional<ConfirmationToken> findByToken(String token);


    @Modifying
    @Query(value = "UPDATE confirmation_token SET confirmed_at = :confirmedAt WHERE token = :token", nativeQuery = true)
    int updateConfirmationDetails(@Param("token") String token, @Param("confirmedAt") LocalDateTime confirmedAt);


    @Query("SELECT ct FROM ConfirmationToken ct WHERE ct.student.id = :studentId AND ct.confirmedAt IS NULL AND ct.expiresAt > :now")
    Optional<ConfirmationToken> findActiveTokenByStudentId(@Param("studentId") Long studentId, @Param("now") LocalDateTime now);
}

