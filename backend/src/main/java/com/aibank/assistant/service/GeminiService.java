package com.aibank.assistant.service;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GeminiService {
    private final String apiKey;
    private final String model;
    private final String endpoint;
    private final RestClient restClient;

    public GeminiService(
            @Value("${app.gemini.api-key}") String apiKey,
            @Value("${app.gemini.model}") String model,
            @Value("${app.gemini.endpoint}") String endpoint
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.endpoint = endpoint;
        this.restClient = RestClient.create();
    }

    @SuppressWarnings("unchecked")
    public String answer(String userPrompt) {
        String systemPrompt = """
                You are an AI Banking Assistant for an Indian retail banking customer.
                Give clear, cautious, compliant banking guidance. Do not claim to access live bank systems.
                For fraud, prioritize safety: never ask for OTP, PIN, CVV, passwords, or remote access.
                Use concise Markdown with practical next steps.
                """;

        if (apiKey == null || apiKey.isBlank()) {
            return fallbackAnswer(userPrompt);
        }

        Map<String, Object> request = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", systemPrompt + "\n\nUser: " + userPrompt)))),
                "generationConfig", Map.of("temperature", 0.35, "maxOutputTokens", 900)
        );

        try {
            Map<String, Object> response = restClient.post()
                    .uri(endpoint + "/" + model + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(Map.class);

            String answer = extractAnswer(response);
            if (!answer.isBlank()) {
                return answer;
            }
        } catch (RuntimeException ex) {
            return fallbackAnswer(userPrompt) + "\n\n_Note: Gemini is not reachable right now, so this response used the local banking assistant fallback._";
        }

        return fallbackAnswer(userPrompt) + "\n\n_Note: Gemini returned an empty response, so this response used the local banking assistant fallback._";
    }

    private String extractAnswer(Map<String, Object> response) {
        if (response == null) {
            return "";
        }

        Object candidatesValue = response.get("candidates");
        if (!(candidatesValue instanceof List<?> candidates) || candidates.isEmpty()) {
            return "";
        }

        Object firstCandidate = candidates.getFirst();
        if (!(firstCandidate instanceof Map<?, ?> candidate)) {
            return "";
        }

        Object contentValue = candidate.get("content");
        if (!(contentValue instanceof Map<?, ?> content)) {
            return "";
        }

        Object partsValue = content.get("parts");
        if (!(partsValue instanceof List<?> parts) || parts.isEmpty()) {
            return "";
        }

        Object firstPart = parts.getFirst();
        if (!(firstPart instanceof Map<?, ?> part)) {
            return "";
        }

        Object text = part.get("text");
        return text == null ? "" : text.toString().trim();
    }

    private String fallbackAnswer(String prompt) {
        String lower = prompt == null ? "" : prompt.toLowerCase();
        if (lower.contains("otp") || lower.contains("fraud") || lower.contains("scam")) {
            return """
                    **This may be sensitive.** Do not share OTP, PIN, CVV, card number, UPI PIN, net-banking password, or screen access with anyone.

                    Recommended next steps:
                    - If you did not initiate the action, ignore the OTP and contact your bank through the official app or card helpline.
                    - Block suspicious cards or UPI mandates immediately.
                    - Report cyber fraud in India at `1930` or the official cybercrime portal.
                    - Keep evidence such as SMS, phone number, screenshots, and transaction IDs.
                    """;
        }
        if (lower.contains("debit") || lower.contains("debited")) {
            return """
                    A debit means money moved out of your account. Common reasons include card purchases, UPI transfers, ATM withdrawal, loan EMI, bank charges, subscriptions, or failed-transaction reversals still in progress.

                    Check the transaction narration, merchant name, date, amount, and reference ID. If it was not authorized by you, freeze the payment instrument and raise a dispute with the bank immediately.
                    """;
        }
        if (lower.contains("credit card") || lower.contains("card")) {
            return """
                    A suitable credit card depends on salary, spending pattern, travel frequency, and repayment discipline.

                    For groceries and online shopping, prefer cashback cards. For travel, prefer cards with lounge access and low forex markup. Avoid premium-fee cards unless annual rewards are higher than the fee.
                    """;
        }
        return """
                I can help with banking questions, transaction explanations, EMI planning, card selection, and fraud awareness.

                Share the transaction details or your banking question, and I will explain it in simple terms with practical next steps.
                """;
    }
}
