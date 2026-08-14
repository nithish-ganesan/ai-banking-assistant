package com.aibank.assistant.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final JwtDecoder firebaseJwtDecoder;

    public JwtAuthenticationFilter(JwtService jwtService, @Qualifier("firebaseJwtDecoder") JwtDecoder firebaseJwtDecoder) {
        this.jwtService = jwtService;
        this.firebaseJwtDecoder = firebaseJwtDecoder;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (!authenticateAppToken(token) && !authenticateFirebaseToken(token)) {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }

    private boolean authenticateAppToken(String token) {
        try {
            String email = jwtService.subject(token);
            String role = jwtService.role(token);
            setAuthentication(email, jwtService.name(token), role == null ? "USER" : role);
            return true;
        } catch (RuntimeException ignored) {
            return false;
        }
    }

    private boolean authenticateFirebaseToken(String token) {
        try {
            Jwt firebaseToken = firebaseJwtDecoder.decode(token);
            String email = firebaseToken.getClaimAsString("email");
            Boolean emailVerified = firebaseToken.getClaim("email_verified");
            if (email == null || !email.toLowerCase().endsWith("@gmail.com") || !Boolean.TRUE.equals(emailVerified)) {
                return false;
            }
            String name = firebaseToken.getClaimAsString("name");
            setAuthentication(email.toLowerCase(), name == null ? email : name, "USER");
            return true;
        } catch (RuntimeException ignored) {
            return false;
        }
    }

    private void setAuthentication(String email, String name, String role) {
        var auth = new UsernamePasswordAuthenticationToken(
                email,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        auth.setDetails(name);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
