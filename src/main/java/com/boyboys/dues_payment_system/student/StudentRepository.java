package com.boyboys.dues_payment_system.student;


import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Student> findByEmail(String email);


    Page<Student> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    boolean existsByEmail(String email);

    Page<Student> findByProgramme(Programme programme, Pageable pageable);

    Page<Student> findByProgrammeAndPaymentStatus(Programme programme, PaymentStatus paymentStatus, Pageable pageable);

    List<Student> findAllByPaymentStatus(PaymentStatus paymentStatus);

    long countByProgramme(Programme programme);

    long countByProgrammeAndPaymentStatus(Programme programme, PaymentStatus paymentStatus);

    long countByPaymentStatus(PaymentStatus paymentStatus);

    long countByLevel(Level level);

    long countByProgrammeAndLevel(Programme programme, Level level);

    long countByLevelAndPaymentStatus(Level level, PaymentStatus paymentStatus);
    long countByProgrammeAndLevelAndPaymentStatus(Programme programme, Level level, PaymentStatus paymentStatus);


}
