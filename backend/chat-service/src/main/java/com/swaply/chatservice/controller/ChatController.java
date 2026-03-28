package com.swaply.chatservice.controller;

import com.swaply.chatservice.dto.ApiResponse;
import com.swaply.chatservice.dto.ConversationDto;
import com.swaply.chatservice.dto.MessageDto;
import com.swaply.chatservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void chatEndpoints(@Payload MessageDto message, StompHeaderAccessor accessor) {
        chatService.sendMessageToUser(message, accessor);
    }

    @MessageMapping("/chat.read")
    public void markAsRead(@Payload MessageDto message, StompHeaderAccessor headerAccessor) {
        String currentUsername = (String) headerAccessor.getSessionAttributes().get("username");
        chatService.markMessageAsRead(message.getId(), currentUsername);
    }

    @GetMapping("/history/{otherUserId}")
    public ResponseEntity<List<MessageDto>> getHistory(@PathVariable UUID otherUserId, @RequestHeader("X-User-Id") UUID currentUserId) {
        return ResponseEntity.ok(chatService.getMessagesWithUser(currentUserId, otherUserId));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> getConversations(@RequestHeader("X-User-Id") UUID currentUserId, @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(chatService.getConversations(currentUserId, token));
    }


    @PutMapping("/{messageId}/report-message")
    public void reportMessage(@PathVariable String messageId) {
        chatService.reportMessage(messageId);
    }

    @GetMapping("/reported-messages")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getReportedMessages() {
        return ResponseEntity.ok(ApiResponse.success(chatService.getReportedMessages()));
    }

    @PutMapping("/reported/ban")
    public void setBanned(@RequestParam String messageId) {
        chatService.setBanned(messageId);
    }

    @PutMapping("/reported/resolved")
    public void setResolved(@RequestParam String messageId) {
        chatService.setResolved(messageId);
    }
}
