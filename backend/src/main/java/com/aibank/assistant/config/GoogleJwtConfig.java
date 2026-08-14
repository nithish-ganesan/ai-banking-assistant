package com.aibank.assistant.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@Configuration
public class GoogleJwtConfig {
    @Bean
    JwtDecoder googleJwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withIssuerLocation("https://accounts.google.com").build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("https://accounts.google.com"));
        return decoder;
    }
}
