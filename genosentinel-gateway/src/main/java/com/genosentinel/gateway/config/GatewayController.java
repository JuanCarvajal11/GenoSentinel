package com.genosentinel.gateway.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class GatewayController {

    private final RoutingService routingService;

    @PreAuthorize("hasRole('ADMIN')")
    @RequestMapping("/**")
    public ResponseEntity<String> handleAll(
            HttpServletRequest request,
            @RequestBody(required = false) String body
    ) {
        return routingService.routeRequest(request, body);
    }
}

