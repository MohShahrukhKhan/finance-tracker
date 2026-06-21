package com.finance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    public void sendPasswordResetEmail(String to, String resetUrl) {
        log.info("========================================");
        log.info("Password reset requested for: {}", to);
        log.info("Reset URL: {}", resetUrl);
        log.info("========================================");
    }
}
