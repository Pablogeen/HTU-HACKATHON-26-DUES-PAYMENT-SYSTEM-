package com.boyboys.dues_payment_system.users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

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
    @Column(name = "level", length = 3)
    private Integer level;
    @Enumerated(EnumType.STRING)
    private Qualification QualificationType;
    @Enumerated(EnumType.STRING)
    private Role role;



}
