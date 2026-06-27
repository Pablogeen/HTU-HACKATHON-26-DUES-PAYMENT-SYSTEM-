package com.boyboys.dues_payment_system.payment;

import com.boyboys.dues_payment_system.student.Programme;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Transaction> findByReference(String reference);

    List<Transaction> findByStudentId(Long studentId);

    boolean existsByStudentIdAndStatus(Long studentId, TransactionStatus status);


    Optional<Transaction> findByStudentIdAndStatus(Long studentId, TransactionStatus status);

    @Query("SELECT t FROM Transaction t WHERE t.status = 'PENDING' AND t.createdAt < :threshold")
    List<Transaction> findPendingTransactionsOlderThan(@Param("threshold") LocalDateTime threshold);


    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'PAID'")
    Long sumPaidTransactions();

    List<Transaction> findAllByStatus(TransactionStatus status);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'PAID' AND t.student.programme = :programme")
    Long sumPaidTransactionsByProgramme(@Param("programme") Programme programme);
}
