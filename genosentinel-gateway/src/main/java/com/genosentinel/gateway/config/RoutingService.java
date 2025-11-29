package com.genosentinel.gateway.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class RoutingService {

    private final RestTemplate restTemplate;
    private final RouteRegistry routeRegistry;

    public ResponseEntity<String> routeRequest(HttpServletRequest request, String body) {

        String path = request.getRequestURI();
        HttpMethod method = HttpMethod.valueOf(request.getMethod());

        return routeRegistry.getRoute(path)
                .map(baseUrl -> forwardRequest(baseUrl, path, method, request, body))
                .orElseThrow(() -> new RuntimeException("Route not found for path: " + path));
    }

    private ResponseEntity<String> forwardRequest(
            String baseUrl,
            String path,
            HttpMethod method,
            HttpServletRequest request,
            String body
    ) {
        // Copiar headers del request original
        HttpHeaders headers = new HttpHeaders();
        Collections.list(request.getHeaderNames())
                .forEach(h -> headers.add(h, request.getHeader(h)));

        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        String targetUrl = baseUrl + path;
        String queryString = request.getQueryString();
        if (queryString != null && !queryString.isEmpty()) {
            targetUrl = targetUrl + "?" + queryString;
        }

        try {
            // Enviar la solicitud al microservicio destino
            return restTemplate.exchange(
                    targetUrl,
                    method,
                    entity,
                    String.class
            );

        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            // Reenviar EXACTAMENTE el JSON que devuelve el microservicio
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsString());
        }
    }
}
