package rhflow.backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import rhflow.backend.dto.FeriasRequest;
import rhflow.backend.dto.FeriasResponse;
import rhflow.backend.service.FeriasService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import rhflow.backend.dto.MinhasFeriasRequest;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ferias")
public class FeriasController {

    private final FeriasService feriasService;

    public FeriasController(
            FeriasService feriasService
    ) {
        this.feriasService = feriasService;
    }

    @PreAuthorize("hasAuthority('FERIAS_GERENCIAR')")
@PostMapping
public ResponseEntity<FeriasResponse> solicitar(
        @Valid @RequestBody FeriasRequest request
) {
    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                    feriasService.solicitar(request)
            );
}

    @PreAuthorize("""
    hasAnyAuthority(
        'FERIAS_VISUALIZAR',
        'FERIAS_APROVAR',
        'FERIAS_GERENCIAR'
    )
""")
@GetMapping
    public ResponseEntity<List<FeriasResponse>> listarTodos() {

        return ResponseEntity.ok(
                feriasService.listarTodos()
        );
    }

    @PreAuthorize("""
    hasAnyAuthority(
        'FERIAS_VISUALIZAR',
        'FERIAS_APROVAR',
        'FERIAS_GERENCIAR'
    )
""")
    @GetMapping("/{id}")
    public ResponseEntity<FeriasResponse> buscarPorId(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.buscarPorId(id)
        );
    }

    @PreAuthorize("""
    hasAnyAuthority(
        'FERIAS_VISUALIZAR',
        'FERIAS_APROVAR',
        'FERIAS_GERENCIAR'
    )
""")
    @GetMapping("/funcionario/{funcionarioId}")
    public ResponseEntity<List<FeriasResponse>>
    listarPorFuncionario(
            @PathVariable UUID funcionarioId
    ) {

        return ResponseEntity.ok(
                feriasService.listarPorFuncionario(
                        funcionarioId
                )
        );
    }

    @PreAuthorize("hasAnyAuthority('FERIAS_APROVAR', 'FERIAS_GERENCIAR')")
    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<FeriasResponse> aprovar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.aprovar(id)
        );
    }

    @PreAuthorize("hasAnyAuthority('FERIAS_APROVAR', 'FERIAS_GERENCIAR')")
    @PatchMapping("/{id}/rejeitar")
    public ResponseEntity<FeriasResponse> rejeitar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.rejeitar(id)
        );
    }

    @PreAuthorize("hasAuthority('FERIAS_GERENCIAR')")
    @PatchMapping("/{id}/iniciar")
    public ResponseEntity<FeriasResponse> iniciar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.iniciar(id)
        );
    }

    @PreAuthorize("hasAuthority('FERIAS_GERENCIAR')")
    @PatchMapping("/{id}/concluir")
    public ResponseEntity<FeriasResponse> concluir(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.concluir(id)
        );
    }

    @PreAuthorize("hasAuthority('FERIAS_GERENCIAR')")
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<FeriasResponse> cancelar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.cancelar(id)
        );
    }

    @PreAuthorize(
    "hasAnyAuthority('FERIAS_SOLICITAR', 'FERIAS_GERENCIAR')"
)
@PostMapping("/minhas")
public ResponseEntity<FeriasResponse>
solicitarMinhasFerias(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody MinhasFeriasRequest request
) {
    UUID usuarioId =
            UUID.fromString(jwt.getSubject());

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                    feriasService
                            .solicitarMinhasFerias(
                                    usuarioId,
                                    request
                            )
            );
}

@PreAuthorize(
    "hasAnyAuthority('FERIAS_SOLICITAR', 'FERIAS_GERENCIAR')"
)
@GetMapping("/minhas")
public ResponseEntity<List<FeriasResponse>>
listarMinhasFerias(
        @AuthenticationPrincipal Jwt jwt
) {
    UUID usuarioId =
            UUID.fromString(jwt.getSubject());

    return ResponseEntity.ok(
            feriasService.listarMinhasFerias(
                    usuarioId
            )
    );
}
}