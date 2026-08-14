package com.aibank.assistant.repository;

import com.aibank.assistant.entity.ChatMessage;
import com.aibank.assistant.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findTop30ByUserOrderByCreatedAtDesc(User user);
    void deleteByUser(User user);
}
