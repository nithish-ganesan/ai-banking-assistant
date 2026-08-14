package com.aibank.assistant.service;

import com.aibank.assistant.dto.BankingDtos.ChatHistoryItem;
import com.aibank.assistant.dto.BankingDtos.ChatResponse;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    private final GeminiService geminiService;

    public ChatService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public ChatResponse chat(String prompt) {
        return new ChatResponse(geminiService.answer(prompt), Instant.now());
    }

    public List<ChatHistoryItem> history() {
        return List.of();
    }

    public void clear() {
        // Static POC: chat history is not persisted.
    }
}
