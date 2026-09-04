package com.aibank.assistant.service;

import com.aibank.assistant.dto.AuthDtos.AuthResponse;
import com.aibank.assistant.dto.AuthDtos.UserProfile;
import com.aibank.assistant.entity.Role;
import com.aibank.assistant.exception.ApiException;
import com.aibank.assistant.security.JwtService;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final JwtService jwtService;
    private final JwtDecoder googleJwtDecoder;
    private final String googleClientId;

    public UserService(
            JwtService jwtService,
            JwtDecoder googleJwtDecoder,
            @Value("${app.google.client-id}") String googleClientId
    ) {
        this.jwtService = jwtService;
        this.googleJwtDecoder = googleJwtDecoder;
        this.googleClientId = googleClientId;
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

        String email = claimAsString(googleToken, "email").toLowerCase();
        if (email.isBlank() || !email.endsWith("@gmail.com")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Please sign in with a Gmail account");
        }

        String name = googleName(googleToken, email);
        UserProfile profile = profile(email, name, Role.USER.name());
        return new AuthResponse(jwtService.generate(email, name, Role.USER.name()), profile);
    }

    public UserProfile currentProfile(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        String email = authentication.getName();
        String name = authentication.getDetails() instanceof String details && !details.isBlank()
                ? details
                : defaultName(email);
        return profile(email, name, Role.USER.name());
    }

    private UserProfile profile(String email, String name, String role) {
        long staticId = Math.abs((long) email.hashCode());
        return new UserProfile(staticId, name, email, role);
    }

    private String googleName(Jwt token, String email) {
        String name = claimAsString(token, "name");
        if (!name.isBlank()) {
            return name;
        }
        return defaultName(email);
    }

    private String defaultName(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex > 0) {
            return email.substring(0, atIndex);
        }
        return email.isBlank() ? "User" : email;
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
