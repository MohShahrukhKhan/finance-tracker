package com.finance.config;

import com.finance.entity.User;
import com.finance.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final TokenService tokenService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public OAuth2SuccessHandler(TokenService tokenService,
                                UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        var oauth = (OAuth2AuthenticationToken) authentication;
        String email = oauth.getPrincipal().getAttribute("email");

        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setName(oauth.getPrincipal().getAttribute("name"));
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            userRepository.save(user);
        }

        String jwt = tokenService.generateToken(email);
        getRedirectStrategy().sendRedirect(request, response,
            "http://localhost:5174/login?token=" + jwt);
    }
}
