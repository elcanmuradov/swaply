package com.swaply.chatservice.service;

import com.swaply.chatservice.client.MediaClient;
import com.swaply.chatservice.client.UserClient;
import com.swaply.chatservice.dto.ConversationDto;
import com.swaply.chatservice.dto.MessageDto;
import com.swaply.chatservice.dto.user.UserDto;
import com.swaply.chatservice.entity.Message;
import com.swaply.chatservice.exception.NotFoundException;
import com.swaply.chatservice.repository.ChatRepository;
import com.swaply.chatservice.utils.enums.MessageStatus;
import com.swaply.chatservice.utils.enums.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final UserClient userClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRepository ChatRepository;
    private final MediaClient mediaClient;

    public void sendMessageToUser(MessageDto incomingMessage, StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (principal == null) {
            throw new NotFoundException("User not authenticated");
        }
        String senderUsername = principal.getName();
        UUID senderId = (UUID) accessor.getSessionAttributes().get("userId");

        Optional.ofNullable(senderId).orElseThrow(()-> new NotFoundException("SenderId  is null."));
        Optional.ofNullable(senderUsername).orElseThrow(()-> new NotFoundException("SenderUsername is null."));

        incomingMessage.setSenderId(senderId);
        incomingMessage.setSentAt(LocalDateTime.now());
        incomingMessage.setRead(false);

        UUID receiverId = Optional.ofNullable(incomingMessage.getReceiverId()).orElseThrow(() -> new NotFoundException("ReceiverId is null."));
        String token = (String) accessor.getSessionAttributes().get("token");

        UserDto receiverUser = userClient.getUserById(receiverId, token).getData();

        if (receiverUser == null) {
            throw new IllegalArgumentException("Alıcı kullanıcı bulunamadı: " + receiverId);
        }

        saveMessage(incomingMessage);

        messagingTemplate.convertAndSendToUser(
                receiverUser.getEmail(),
                "/queue/messages",
                incomingMessage
        );
        log.info("Message sent to {}", incomingMessage.getSenderId());
    }

    public void saveMessage(MessageDto incomingMessage) {
        log.info("Saving message to user: {}", incomingMessage.getSenderId());
        Message message = Message.builder()
                .senderId(incomingMessage.getSenderId())
                .receiverId(incomingMessage.getReceiverId())
                .content(incomingMessage.getContent())
                .productId(incomingMessage.getProductId())
                .sentAt(incomingMessage.getSentAt())
                .messageType(incomingMessage.getMessageType())
                .isRead(incomingMessage.isRead())
                .build();
        ChatRepository.save(message);
        incomingMessage.setId(message.getId());
        log.info("Saved message: {}", incomingMessage);
    }

    public List<MessageDto> getMessagesWithUser(UUID userId, UUID otherUserId) {
        log.info("Getting messages with user {} and other user {}", userId, otherUserId);
        List<Message> messages = ChatRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderBySentAtAsc(userId, otherUserId, userId, otherUserId);
        return messages.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ConversationDto> getConversations(UUID userId, String token) {
        log.info("Getting conversations with info for user {}", userId);

        List<Message> messages = ChatRepository.findConversationsByUserId(userId);
        return messages.stream()
                .map(msg -> msg.getSenderId().equals(userId) ? msg.getReceiverId() : msg.getSenderId())
                .distinct()
                .map(otherUserId -> {
                    String name = "İstifadəçi " + otherUserId.toString().substring(0, 5);
                    try {
                        UserDto userDto = userClient.getUserById(otherUserId, token).getData();
                        if (userDto != null && userDto.getName() != null) {
                            name = userDto.getName();
                        }
                    } catch (Exception e) {
                        log.warn("Failed to fetch user name for {}: {}", otherUserId, e.getMessage());
                    }

                    // Find last message for this conversation
                    Optional<Message> lastMsgOpt = messages.stream()
                            .filter(m -> m.getSenderId().equals(otherUserId) || m.getReceiverId().equals(otherUserId))
                            .findFirst();

                    return ConversationDto.builder()
                            .userId(otherUserId)
                            .name(name)
                            .lastMessage(lastMsgOpt.map(Message::getContent).orElse(""))
                            .lastMessageTime(lastMsgOpt.map(Message::getSentAt).orElse(null))
                            .unreadCount(0) // TODO: implement count
                            .build();
                })
                .collect(Collectors.toList());
    }

    public void reportMessage(String messageId) {
       Message message = ChatRepository.findById(messageId).orElseThrow(() -> new NotFoundException("MessageId: " + messageId));
       message.setIsReported(true);
       message.setReportedAt(LocalDateTime.now());
       message.setStatus(MessageStatus.PENDING);
       log.info("Reported message: {}", message);
       ChatRepository.save(message);
    }


    public List<MessageDto> getReportedMessages() {
        List<Message> messages = ChatRepository.findMessagesByIsReported(true);
        List<MessageDto> dtos = new ArrayList<>();
        messages.forEach(message-> {
            dtos.add(toDto(message));
        });

        return dtos;
    }

    public void setBanned(String messageId) {
        Message message =  ChatRepository.findById(messageId).orElseThrow(() -> new NotFoundException("MessageId: " + messageId));
        message.setStatus(MessageStatus.BANNED);
        ChatRepository.save(message);
    }

    public void setResolved(String messageId) {
        Message message =  ChatRepository.findById(messageId).orElseThrow(() -> new NotFoundException("MessageId: " + messageId));
        message.setStatus(MessageStatus.RESOLVED);
        ChatRepository.save(message);
    }

    public void markMessageAsRead(String messageId, String currentUsername) {
        Optional<Message> messageOpt = ChatRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            message.setIsRead(true);
            ChatRepository.save(message);
        }
    }

    private MessageDto toDto(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .content(message.getContent())
                .productId(message.getProductId())
                .sentAt(message.getSentAt())
                .messageType(message.getMessageType())
                .isRead(message.getIsRead())
                .isReported(message.getIsReported())
                .reportedAt(message.getReportedAt())
                .status(message.getStatus())
                .build();
    }
}
