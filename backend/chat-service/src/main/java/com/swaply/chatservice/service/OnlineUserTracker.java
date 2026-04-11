package com.swaply.chatservice.service;

import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class OnlineUserTracker {

    private final ConcurrentHashMap<UUID, AtomicInteger> onlineUsers = new ConcurrentHashMap<>();

    public void markOnline(UUID userId) {
        if (userId == null) {
            return;
        }
        onlineUsers.compute(userId, (key, count) -> {
            if (count == null) {
                return new AtomicInteger(1);
            }
            count.incrementAndGet();
            return count;
        });
    }

    public void markOffline(UUID userId) {
        if (userId == null) {
            return;
        }
        onlineUsers.computeIfPresent(userId, (key, count) -> {
            if (count.decrementAndGet() <= 0) {
                return null;
            }
            return count;
        });
    }

    public boolean isOnline(UUID userId) {
        if (userId == null) {
            return false;
        }
        AtomicInteger sessions = onlineUsers.get(userId);
        return sessions != null && sessions.get() > 0;
    }
}
