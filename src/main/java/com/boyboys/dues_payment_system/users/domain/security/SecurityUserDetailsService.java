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

    private final StudentRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Student user = userRepo.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("STUDENT NOT FOUND"));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .roles(user.getRole().name())
                .build();
    }
}