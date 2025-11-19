package com.genosentinel.gateway.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;
    private final AuthConfig authConfig; // clase que lee user/pass del application.properties

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> req) {

        String username = req.get("username");
        String password = req.get("password");

        // Validar contra user/pass fijos del application.properties
        if (!authConfig.getUsername().equals(username) ||
                !authConfig.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bad credentials");
        }

        List<String> roles = List.of("ADMIN");
        String token = jwtService.generate(username, roles);

        return Map.of(
                "access_token", token,
                "token_type", "Bearer",
                "roles", roles
        );
    }
}
