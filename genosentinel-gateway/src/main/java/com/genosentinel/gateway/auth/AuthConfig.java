package com.genosentinel.gateway.auth;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class AuthConfig {

    @Value("${auth.user}")
    private String username;

    @Value("${auth.password}")
    private String password;
}
