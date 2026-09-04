package com.aibank.assistant.controller;

import com.aibank.assistant.dto.BankingDtos.ChatHistoryItem;
import com.aibank.assistant.dto.BankingDtos.ChatRequest;
import com.aibank.assistant.dto.BankingDtos.ChatResponse;
import com.aibank.assistant.service.ChatService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/chat", "/api/v1/chat"})
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return chatService.chat(request.message());
    }

    @GetMapping("/history")
    public List<ChatHistoryItem> history() {
        return chatService.history();
    }

    @DeleteMapping("/history")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear() {
        chatService.clear();
    }
}
