package com.boyboys.dues_payment_system.student.domain;


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
public class RefreshToken {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expires;

    @Column(nullable = false)
    private boolean revoked;

    @ManyToOne
    @JoinColumn(name="student_id", nullable = false)
    private Student student;
}
