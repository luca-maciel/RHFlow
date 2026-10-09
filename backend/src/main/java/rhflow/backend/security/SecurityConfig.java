package rhflow.backend.security;

import java.util.List;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            RhflowJwtAuthenticationConverter jwtConverter) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // Endpoint público
                        .requestMatchers(
                                HttpMethod.POST,
                                "/auth/login")
                        .permitAll()

                        // Usuários
                        .requestMatchers("/usuarios/**")
                        .hasAnyAuthority(
                                "USUARIOS_VISUALIZAR",
                                "USUARIOS_GERENCIAR")

                        // Perfis
                        .requestMatchers("/perfis/**")
                        .hasAnyAuthority(
                                "PERFIS_VISUALIZAR",
                                "PERFIS_GERENCIAR")

                        // Permissões
                        .requestMatchers("/permissoes/**")
                        .hasAnyAuthority(
                                "PERMISSOES_VISUALIZAR",
                                "PERMISSOES_GERENCIAR")

                        // Obrigatoriamente por último
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter)))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(
                                new BearerTokenAuthenticationEntryPoint())
                        .accessDeniedHandler(
                                new BearerTokenAccessDeniedHandler()));

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                List.of("http://localhost:5173", "http://localhost:8080", "http://192.168.137.37:5173", "http://192.168.137.37:8080", "http://192.168.140.194:5173", "http://192.168.140.194:8080", "http://192.168.0.15:5173", "http://192.168.0.15:8080", "http://192.168.141.93:5173", "http://192.168.141.93:8080", "http://192.168.0.21:5173", "http://192.168.0.21:8080"));

        config.setAllowedMethods(
                List.of(
                        "GET", "POST", "PUT",
                        "PATCH", "DELETE", "OPTIONS"));

        config.setAllowedHeaders(
                List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}