package com.boyboys.dues_payment_system.student;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);


    Page<Student> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);

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


    boolean existsByPhoneNumber(String phoneNumber);
}
