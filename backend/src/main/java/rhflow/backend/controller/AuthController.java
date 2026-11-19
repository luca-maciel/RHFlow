package rhflow.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import rhflow.backend.dto.AuthMeResponse;
import rhflow.backend.dto.ForgotPasswordRequest;
import rhflow.backend.dto.LoginRequest;
import rhflow.backend.dto.LoginResponse;
import rhflow.backend.dto.ResetPasswordRequest;
import rhflow.backend.service.AuthService;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
            authService.login(request)
        );
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<AuthMeResponse> me(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID usuarioId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
            authService.me(usuarioId)
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authService.solicitarRecuperacaoSenha(request);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Se o e-mail estiver cadastrado e ativo, enviaremos um código de verificação."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.redefinirSenha(request);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Senha redefinida com sucesso."
        ));
    }
}