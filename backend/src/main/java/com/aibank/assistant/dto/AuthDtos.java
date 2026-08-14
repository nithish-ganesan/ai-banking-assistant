package com.aibank.assistant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @Size(min = 6) String password
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record GoogleLoginRequest(@NotBlank String idToken) {}

    public record AuthResponse(String token, UserProfile user) {}

    public record UserProfile(Long id, String name, String email, String role) {}
}
