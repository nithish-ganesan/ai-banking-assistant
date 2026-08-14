package com.aibank.assistant.controller;

import com.aibank.assistant.dto.BankingDtos.ChatHistoryItem;
import com.aibank.assistant.dto.BankingDtos.ChatRequest;
import com.aibank.assistant.dto.BankingDtos.ChatResponse;
import com.aibank.assistant.entity.User;
import com.aibank.assistant.service.ChatService;
import com.aibank.assistant.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;
    private final UserService userService;

    public ChatController(ChatService chatService, UserService userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request, Authentication authentication) {
        User user = userService.currentUser(authentication);
        return chatService.chat(user, request.message());
    }

    @GetMapping("/history")
    public List<ChatHistoryItem> history(Authentication authentication) {
        User user = userService.currentUser(authentication);
        return chatService.history(user);
    }

    @DeleteMapping("/history")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(Authentication authentication) {
        User user = userService.currentUser(authentication);
        chatService.clear(user);
    }
}
