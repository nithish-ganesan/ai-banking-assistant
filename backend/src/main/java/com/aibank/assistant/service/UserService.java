package com.aibank.assistant.service;

import com.aibank.assistant.dto.AuthDtos.AuthResponse;
import com.aibank.assistant.dto.AuthDtos.LoginRequest;
import com.aibank.assistant.dto.AuthDtos.RegisterRequest;
import com.aibank.assistant.dto.AuthDtos.UserProfile;
import com.aibank.assistant.entity.User;
import com.aibank.assistant.exception.ApiException;
import com.aibank.assistant.repository.UserRepository;
import com.aibank.assistant.security.JwtService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtDecoder googleJwtDecoder;
    private final String googleClientId;

    public UserService(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JwtDecoder googleJwtDecoder,
            @Value("${app.google.client-id}") String googleClientId
    ) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleJwtDecoder = googleJwtDecoder;
        this.googleClientId = googleClientId;
    }

    public AuthResponse register(RegisterRequest request) {
        if (users.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        users.save(user);
        return authResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return authResponse(user);
    }

    public User currentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return users.findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public UserProfile profile(User user) {
        return new UserProfile(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse googleLogin(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Google login is not configured");
        }

        Jwt googleToken = googleJwtDecoder.decode(idToken);
        if (!audience(googleToken).contains(googleClientId)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google token was issued for a different client");
        }
        if (!Boolean.TRUE.equals(googleToken.getClaim("email_verified"))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Please use a verified Google account");
        }

        String normalizedEmail = claimAsString(googleToken, "email").toLowerCase();
        if (normalizedEmail.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google account did not provide an email");
        }

        User user = users.findByEmail(normalizedEmail).orElseGet(() -> {
            User created = new User();
            created.setName(googleName(googleToken, normalizedEmail));
            created.setEmail(normalizedEmail);
            return users.save(created);
        });
        return authResponse(user);
    }

    public AuthResponse tokenLogin(String token) {
        String email = jwtService.subject(token);
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return new AuthResponse(token, profile(user));
    }

    private AuthResponse authResponse(User user) {
        return new AuthResponse(jwtService.generate(user), profile(user));
    }

    private String googleName(Jwt token, String email) {
        String name = claimAsString(token, "name");
        if (name != null && !name.isBlank()) {
            return name;
        }
        return email.substring(0, email.indexOf('@'));
    }

    private String claimAsString(Jwt token, String claim) {
        Object value = token.getClaim(claim);
        return value == null ? "" : value.toString().trim();
    }

    private List<String> audience(Jwt token) {
        Object value = token.getClaims().get("aud");
        if (value instanceof List<?> items) {
            return items.stream().map(Object::toString).toList();
        }
        if (value instanceof String item) {
            return List.of(item);
        }
        return List.of();
    }
}
