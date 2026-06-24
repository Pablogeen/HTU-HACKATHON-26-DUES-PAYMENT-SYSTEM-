package com.boyboys.dues_payment_system.payment.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByReference(String reference);

    List<Transaction> findByStudentId(Long studentId);

    boolean existsByStudentIdAndStatus(Long studentId, TransactionStatus status);

    List<Transaction> findByStatus(TransactionStatus status);

    Optional<Transaction> findByStudentIdAndStatus(Long studentId, TransactionStatus status);
}
