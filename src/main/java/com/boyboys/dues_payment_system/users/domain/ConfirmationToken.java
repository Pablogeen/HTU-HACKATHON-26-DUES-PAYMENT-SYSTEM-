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
    private LocalDateTime created;
    private LocalDateTime expires;
    private LocalDateTime confirmedAt;
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private Student user;

    public ConfirmationToken(String token, LocalDateTime created, LocalDateTime expires, Student user){
        this.token = token;
        this.created= created;
        this.expires=expires;
        this.user=user;
    }
}
