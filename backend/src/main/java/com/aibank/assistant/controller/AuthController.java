package com.aibank.assistant.controller;

import com.aibank.assistant.dto.AuthDtos.AuthResponse;
import com.aibank.assistant.dto.AuthDtos.GoogleLoginRequest;
import com.aibank.assistant.dto.AuthDtos.UserProfile;
import com.aibank.assistant.service.UserService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
public class AuthController {
    private final UserService userService;
    private final String googleClientId;

    public AuthController(UserService userService, @Value("${app.google.client-id}") String googleClientId) {
        this.userService = userService;
        this.googleClientId = googleClientId;
    }

    @PostMapping("/google")
    public AuthResponse googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return userService.googleLogin(request.idToken());
    }

    @GetMapping("/me")
    public UserProfile me(Authentication authentication) {
        return userService.currentProfile(authentication);
    }

    @GetMapping("/google/status")
    public Map<String, String> googleStatus() {
        boolean configured = googleClientId != null && !googleClientId.isBlank();
        return Map.of(
                "status", configured ? "ready" : "not_configured",
                "message", configured ? "Google sign-in is configured." : "Configure GOOGLE_CLIENT_ID to enable Gmail sign-in."
        );
    }
}
