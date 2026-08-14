package com.aibank.assistant.dto;

import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {
    private AuthDtos() {}

    public record GoogleLoginRequest(@NotBlank String idToken) {}

    public record AuthResponse(String token, UserProfile user) {}

    public record UserProfile(Long id, String name, String email, String role) {}
}
