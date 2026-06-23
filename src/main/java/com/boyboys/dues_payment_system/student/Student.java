package com.boyboys.dues_payment_system.student;

import com.boyboys.dues_payment_system.student.domain.Level;
import com.boyboys.dues_payment_system.student.domain.PaymentStatus;
import com.boyboys.dues_payment_system.student.domain.Qualification;
import com.boyboys.dues_payment_system.student.domain.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "first_name", length = 50)
    private String firstName;
    @Column(name = "last_name", length = 50)
    private String lastName;
    @Column(name = "middle_name", length = 50)
    private String middleName;
    @Column(name = "email", length = 50)
    private String email;
    @Column(name = "phone_number", length = 50)
    private String phoneNumber;
    @Enumerated(EnumType.STRING)
    private Level level;
    @Enumerated(EnumType.STRING)
    private Qualification qualificationType;
    @Enumerated(EnumType.STRING)
    private Role role;
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;



}
