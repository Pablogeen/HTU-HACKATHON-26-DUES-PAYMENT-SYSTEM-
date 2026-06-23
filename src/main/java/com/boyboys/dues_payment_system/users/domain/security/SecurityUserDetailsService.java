package com.boyboys.dues_payment_system.users.domain.security;

import com.boyboys.dues_payment_system.users.Student;
import com.boyboys.dues_payment_system.users.domain.StudentRepository;
import com.boyboys.dues_payment_system.users.domain.exception.StudentNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("STUDENT NOT FOUND"));
        return (UserDetails) Student.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .middleName(student.getMiddleName())
                .email(student.getEmail())
                .phoneNumber(student.getPhoneNumber())
                .level(student.getLevel())
                .qualificationType(student.getQualificationType())
                .role(student.getRole())
                .build();
    }
}