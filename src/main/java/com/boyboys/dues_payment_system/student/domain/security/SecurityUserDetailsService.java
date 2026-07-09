package com.boyboys.dues_payment_system.student.domain.security;

import com.boyboys.dues_payment_system.student.Student;
import com.boyboys.dues_payment_system.student.StudentNotFoundException;
import com.boyboys.dues_payment_system.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws StudentNotFoundException {
        Student student = studentRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new StudentNotFoundException("STUDENT NOT FOUND"));
        return new SecurityUserDetails(student);
    }
}