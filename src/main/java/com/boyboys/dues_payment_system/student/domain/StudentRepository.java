package com.boyboys.dues_payment_system.student.domain;


import com.boyboys.dues_payment_system.student.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);


    Page<Student> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);

    boolean existsByEmail(String email);
}
