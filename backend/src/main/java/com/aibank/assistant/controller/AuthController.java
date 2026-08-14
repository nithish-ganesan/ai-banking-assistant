package com.aibank.assistant.controller;

import com.aibank.assistant.dto.AuthDtos.AuthResponse;
import com.aibank.assistant.dto.AuthDtos.GoogleLoginRequest;
import com.aibank.assistant.dto.AuthDtos.UserProfile;
import com.aibank.assistant.service.UserService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
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
        return Map.of(
                "status", "ready",
                "message", "Configure GOOGLE_CLIENT_ID to enable Gmail sign-in."
        );
    }
}
