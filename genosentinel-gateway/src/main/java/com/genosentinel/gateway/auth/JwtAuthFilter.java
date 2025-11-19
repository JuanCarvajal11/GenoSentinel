package com.genosentinel.gateway.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro de autenticación JWT para Spring Security.
 * Intercepta cada petición HTTP y valida el token JWT presente en la cabecera Authorization.
 * Si el token es válido, establece la autenticación en el contexto de seguridad con los roles del usuario.
 * Si el token es inválido o no está presente, la petición continúa sin autenticación.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    /**
     * Servicio para la gestión y validación de tokens JWT.
     */
    private final JwtService jwtService;

    /**
     * Constructor que inyecta el servicio JWT.
     * @param jwtService servicio para parsear y validar tokens
     */
    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * Metodo principal del filtro que intercepta cada petición HTTP.
     * Extrae el token JWT de la cabecera Authorization, lo valida y establece la autenticación.
     * Si el token no es válido, limpia el contexto de seguridad.
     * @param req petición HTTP
     * @param res respuesta HTTP
     * @param chain cadena de filtros
     * @throws ServletException si ocurre un error en el filtro
     * @throws IOException si ocurre un error de IO
     */
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        // Extrae la cabecera Authorization
        String header = req.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(req, res);
            return;
        }

        // Extrae el token JWT
        String token = header.substring(7);
        try {
            // Parsea y valida el token
            io.jsonwebtoken.Claims claims = jwtService.parse(token);
            String username = claims.getSubject();

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) claims.get("roles");

            // Convierte los roles en autoridades de Spring Security
            List<SimpleGrantedAuthority> authorities =
                    (roles == null ? List.<String>of() : roles).stream()
                            .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                            .map(SimpleGrantedAuthority::new)
                            .toList();

            // Crea el token de autenticación y lo establece en el contexto
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception e) {
            // Si el token es inválido, limpia el contexto de seguridad
            SecurityContextHolder.clearContext();
        }

        // Continúa con la cadena de filtros
        chain.doFilter(req, res);
    }
}