package com.genosentinel.gateway.config;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
public class RouteRegistry {

    private final Map<String, String> routes = Map.of(
            "/clinica", "http://localhost:3000",
            "/genoma", "http://localhost:8000"
    );

    public Optional<String> getRoute(String route) {
        return routes.entrySet().stream()
                .filter(e -> route.startsWith(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst();
    }
}
