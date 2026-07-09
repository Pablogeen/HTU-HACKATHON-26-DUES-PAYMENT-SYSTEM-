package com.boyboys.dues_payment_system.student;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

        Optional<Student> findByEmailAndIsDeletedFalse(String email);

        Page<Student> findByIsDeletedFalse(Pageable pageable);

        Page<Student> findByPaymentStatusAndIsDeletedFalse(PaymentStatus paymentStatus, Pageable pageable);

        Page<Student> findByProgrammeAndIsDeletedFalse(Programme programme, Pageable pageable);

        Page<Student> findByProgrammeAndPaymentStatusAndIsDeletedFalse(Programme programme, PaymentStatus paymentStatus, Pageable pageable);

        List<Student> findAllByPaymentStatusAndIsDeletedFalse(PaymentStatus paymentStatus);

        boolean existsByEmail(String email);
        boolean existsByPhoneNumber(String phoneNumber);

        long countByProgramme(Programme programme);
        long countByProgrammeAndPaymentStatus(Programme programme, PaymentStatus paymentStatus);
        long countByPaymentStatus(PaymentStatus paymentStatus);
        long countByLevel(Level level);
        long countByProgrammeAndLevel(Programme programme, Level level);
        long countByLevelAndPaymentStatus(Level level, PaymentStatus paymentStatus);
        long countByProgrammeAndLevelAndPaymentStatus(Programme programme, Level level, PaymentStatus paymentStatus);
    }

