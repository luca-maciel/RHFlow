package rhflow.backend.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import rhflow.backend.dto.PerfilRequest;
import rhflow.backend.dto.PerfilResponse;
import rhflow.backend.service.PerfilService;

@RestController
@RequestMapping("/perfis")
public class PerfilController {

    private final PerfilService service;

    public PerfilController(PerfilService service) {
        this.service = service;
    }

    @PreAuthorize("hasAuthority('PERFIS_GERENCIAR')")
    @PostMapping
    public ResponseEntity<PerfilResponse> cadastrar(
            @Valid @RequestBody PerfilRequest request
    ) {
        PerfilResponse response = service.cadastrar(request);

        return ResponseEntity
                .created(URI.create("/perfis/" + response.id()))
                .body(response);
    }

    @PreAuthorize("""
        hasAnyAuthority(
            'PERFIS_VISUALIZAR',
            'PERFIS_GERENCIAR'
        )
    """)
    @GetMapping
    public ResponseEntity<List<PerfilResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PreAuthorize("""
        hasAnyAuthority(
            'PERFIS_VISUALIZAR',
            'PERFIS_GERENCIAR'
        )
    """)
    @GetMapping("/{id}")
    public ResponseEntity<PerfilResponse> buscar(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PreAuthorize("hasAuthority('PERFIS_GERENCIAR')")
    @PutMapping("/{id}")
    public ResponseEntity<PerfilResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody PerfilRequest request
    ) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @PreAuthorize("hasAuthority('PERFIS_GERENCIAR')")
    @PostMapping("/{perfilId}/permissoes/{permissaoId}")
    public ResponseEntity<Void> atribuirPermissao(
            @PathVariable UUID perfilId,
            @PathVariable UUID permissaoId
    ) {
        service.atribuirPermissao(perfilId, permissaoId);

        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('PERFIS_GERENCIAR')")
    @DeleteMapping("/{perfilId}/permissoes/{permissaoId}")
    public ResponseEntity<Void> removerPermissao(
            @PathVariable UUID perfilId,
            @PathVariable UUID permissaoId
    ) {
        service.removerPermissao(perfilId, permissaoId);

        return ResponseEntity.noContent().build();
    }
}
