package com.aibank.assistant.controller;

import com.aibank.assistant.dto.BankingDtos.CardRecommendationRequest;
import com.aibank.assistant.dto.BankingDtos.CardRecommendationResponse;
import com.aibank.assistant.dto.BankingDtos.EmiRequest;
import com.aibank.assistant.dto.BankingDtos.EmiResponse;
import com.aibank.assistant.dto.BankingDtos.TransactionSummaryRequest;
import com.aibank.assistant.dto.BankingDtos.TransactionSummaryResponse;
import com.aibank.assistant.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/banking", "/api/v1/banking"})
public class BankingController {
    private final BankingService bankingService;

    public BankingController(BankingService bankingService) {
        this.bankingService = bankingService;
    }

    @PostMapping("/transactions/summary")
    public TransactionSummaryResponse summarize(@Valid @RequestBody TransactionSummaryRequest request) {
        return bankingService.summarize(request);
    }

    @PostMapping("/emi")
    public EmiResponse emi(@Valid @RequestBody EmiRequest request) {
        return bankingService.calculateEmi(request);
    }

    @PostMapping("/cards/recommend")
    public CardRecommendationResponse recommendCard(@Valid @RequestBody CardRecommendationRequest request) {
        return bankingService.recommendCard(request);
    }
}
