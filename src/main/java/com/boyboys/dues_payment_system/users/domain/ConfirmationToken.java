package com.boyboys.dues_payment_system.users.domain;


import com.boyboys.dues_payment_system.users.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ConfirmationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "token", nullable = false, length = 6)
    private String token;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime confirmedAt;
    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "id")
    private Student student;

    public ConfirmationToken(String token, LocalDateTime createdAt, LocalDateTime expiresAt, Student student){
        this.token = token;
        this.createdAt= createdAt;
        this.expiresAt=expiresAt;
        this.student=student;
    }
}
