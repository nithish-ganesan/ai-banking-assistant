package com.aibank.assistant.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class BankingDtos {
    private BankingDtos() {}

    public record ChatRequest(@NotBlank String message) {}
    public record ChatResponse(String answer, Instant createdAt) {}
    public record ChatHistoryItem(String prompt, String response, Instant createdAt) {}

    public record TransactionInput(
            @NotBlank String date,
            @NotBlank String description,
            @NotBlank String category,
            @DecimalMin(value = "0.0", inclusive = false) BigDecimal amount,
            @NotBlank String type
    ) {}

    public record TransactionSummaryRequest(@NotEmpty List<TransactionInput> transactions) {}
    public record TransactionSummaryResponse(
            BigDecimal income,
            BigDecimal expense,
            BigDecimal netSavings,
            List<CategoryTotal> topCategories,
            List<String> suggestions
    ) {}

    public record CategoryTotal(String category, BigDecimal amount) {}

    public record EmiRequest(
            @DecimalMin(value = "1.0") BigDecimal loanAmount,
            @DecimalMin(value = "0.1") BigDecimal annualInterestRate,
            @Positive int tenureMonths
    ) {}

    public record EmiResponse(BigDecimal monthlyEmi, BigDecimal totalInterest, BigDecimal totalPayable) {}

    public record CardRecommendationRequest(
            @DecimalMin(value = "0.0") BigDecimal salary,
            @NotBlank String spendingHabits,
            @NotBlank String travelFrequency,
            @NotBlank String shoppingPreference
    ) {}

    public record CardRecommendationResponse(String cardName, List<String> reasons, List<String> cautions) {}
}
