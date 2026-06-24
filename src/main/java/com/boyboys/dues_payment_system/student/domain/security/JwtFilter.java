package com.boyboys.dues_payment_system.student.domain.security;


import com.boyboys.dues_payment_system.student.Student;
import com.boyboys.dues_payment_system.student.StudentRepository;
import com.boyboys.dues_payment_system.student.StudentNotFoundException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

        private final JwtHelper jwtHelper;
        private final SecurityUserDetailsService userDetailsService;
        private final StudentRepository userRepo;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        List<String> publicPaths = List.of(
                "/api/v1/auth/login",
                "/api/v1/auth/verify",
                "/api/v1/students/register-student",
                "/api/v1/auth/resend-verification",
                "/swagger-ui.html");
        return publicPaths.contains(path) ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs");
    }


    @Override
        public void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {

            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7);
            String email = jwtHelper.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtHelper.isTokenValid(token, userDetails)) {
                    Student student = userRepo.findByEmail(userDetails.getUsername())
                            .orElseThrow(() -> new StudentNotFoundException("USER NOT FOUND"));

                    String role = jwtHelper.extractRole(token);

                    List<GrantedAuthority> authorities =
                            List.of(new SimpleGrantedAuthority(role));

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(student, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            filterChain.doFilter(request, response);
        }
    }
