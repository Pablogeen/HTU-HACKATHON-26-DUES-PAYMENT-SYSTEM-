package com.boyboys.dues_payment_system.payment.domain;

import com.boyboys.dues_payment_system.student.Student;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference;

    private String accessCode;

    private String paystackReference;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Student student;
}
