package com.aibank.assistant.service;

import com.aibank.assistant.dto.BankingDtos.ChatHistoryItem;
import com.aibank.assistant.dto.BankingDtos.ChatResponse;
import com.aibank.assistant.entity.ChatMessage;
import com.aibank.assistant.entity.User;
import com.aibank.assistant.repository.ChatMessageRepository;
import jakarta.transaction.Transactional;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    private final GeminiService geminiService;
    private final ChatMessageRepository messages;

    public ChatService(GeminiService geminiService, ChatMessageRepository messages) {
        this.geminiService = geminiService;
        this.messages = messages;
    }

    public ChatResponse chat(User user, String prompt) {
        String answer = geminiService.answer(prompt);
        ChatMessage message = new ChatMessage();
        message.setUser(user);
        message.setPrompt(prompt);
        message.setResponse(answer);
        messages.save(message);
        return new ChatResponse(answer, message.getCreatedAt());
    }

    public List<ChatHistoryItem> history(User user) {
        return messages.findTop30ByUserOrderByCreatedAtDesc(user).stream()
                .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
                .map(message -> new ChatHistoryItem(message.getPrompt(), message.getResponse(), message.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void clear(User user) {
        messages.deleteByUser(user);
    }
}
