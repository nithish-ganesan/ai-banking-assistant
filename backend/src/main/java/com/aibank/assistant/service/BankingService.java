package com.aibank.assistant.service;

import com.aibank.assistant.dto.BankingDtos.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class BankingService {
    public TransactionSummaryResponse summarize(TransactionSummaryRequest request) {
        BigDecimal income = totalByType(request, "credit");
        BigDecimal expense = totalByType(request, "debit");

        Map<String, BigDecimal> categoryTotals = request.transactions().stream()
                .filter(tx -> tx.type().equalsIgnoreCase("debit"))
                .collect(Collectors.groupingBy(
                        TransactionInput::category,
                        Collectors.reducing(BigDecimal.ZERO, TransactionInput::amount, BigDecimal::add)
                ));

        List<CategoryTotal> topCategories = categoryTotals.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(5)
                .map(entry -> new CategoryTotal(entry.getKey(), entry.getValue()))
                .toList();

        List<String> suggestions = List.of(
                "Set an auto-transfer for 10-20% of monthly income immediately after salary credit.",
                "Review the top two spending categories and set category caps for the next month.",
                "Keep an emergency fund equal to at least three months of essential expenses."
        );

        return new TransactionSummaryResponse(income, expense, income.subtract(expense), topCategories, suggestions);
    }

    public EmiResponse calculateEmi(EmiRequest request) {
        BigDecimal monthlyRate = request.annualInterestRate()
                .divide(BigDecimal.valueOf(1200), 12, RoundingMode.HALF_UP);
        BigDecimal onePlusRatePower = BigDecimal.ONE.add(monthlyRate).pow(request.tenureMonths());
        BigDecimal emi = request.loanAmount()
                .multiply(monthlyRate)
                .multiply(onePlusRatePower)
                .divide(onePlusRatePower.subtract(BigDecimal.ONE), 2, RoundingMode.HALF_UP);
        BigDecimal totalPayable = emi.multiply(BigDecimal.valueOf(request.tenureMonths())).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalInterest = totalPayable.subtract(request.loanAmount()).setScale(2, RoundingMode.HALF_UP);
        return new EmiResponse(emi, totalInterest, totalPayable);
    }

    public CardRecommendationResponse recommendCard(CardRecommendationRequest request) {
        String habits = (request.spendingHabits() + " " + request.shoppingPreference() + " " + request.travelFrequency()).toLowerCase();
        if (habits.contains("travel") || habits.contains("flight") || habits.contains("hotel") || habits.contains("frequent")) {
            return new CardRecommendationResponse(
                    "Travel Rewards Platinum Card",
                    List.of("Best fit for flight, hotel, and lounge benefits.", "Reward value improves when travel bookings are concentrated on one card."),
                    List.of("Check annual fee waiver criteria.", "Avoid revolving credit because interest can erase reward value.")
            );
        }
        if (habits.contains("shopping") || habits.contains("online") || habits.contains("amazon") || habits.contains("flipkart")) {
            return new CardRecommendationResponse(
                    "Online Cashback Card",
                    List.of("Strong match for online shopping and marketplace spends.", "Cashback is simpler than points for everyday users."),
                    List.of("Check monthly cashback caps.", "Pay total due before the due date.")
            );
        }
        return new CardRecommendationResponse(
                "Everyday Value Credit Card",
                List.of("Balanced rewards for groceries, utilities, fuel, and dining.", "Lower fee profile is better for moderate monthly spends."),
                List.of("Do not use cash withdrawal on credit cards.", "Keep utilization below 30% where possible.")
        );
    }

    private BigDecimal totalByType(TransactionSummaryRequest request, String type) {
        return request.transactions().stream()
                .filter(tx -> tx.type().equalsIgnoreCase(type))
                .map(TransactionInput::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
