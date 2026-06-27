package com.boyboys.dues_payment_system.student.domain;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RefreshToken> findByTokenWithLock(String token);

    @Query("SELECT rt FROM RefreshToken rt WHERE rt.student.id = :studentId AND rt.revoked = false AND rt.expires > :now")
    Optional<RefreshToken> findActiveTokenByStudentId(@Param("studentId") Long studentId, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.student.id = :studentId")
    void revokeAllStudentTokens(@Param("studentId") Long studentId);
}
