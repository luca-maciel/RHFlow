package rhflow.backend.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import rhflow.backend.dto.PermissaoRequest;
import rhflow.backend.dto.PermissaoResponse;
import rhflow.backend.service.PermissaoService;

@RestController
@RequestMapping("/permissoes")
public class PermissaoController {

    private final PermissaoService service;

    public PermissaoController(PermissaoService service) {
        this.service = service;
    }

    @PreAuthorize("""
                hasAnyAuthority(
                    'PERMISSOES_VISUALIZAR',
                    'PERMISSOES_GERENCIAR'
                )
            """)
    @GetMapping
    public ResponseEntity<List<PermissaoResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PreAuthorize("""
                hasAnyAuthority(
                    'PERMISSOES_VISUALIZAR',
                    'PERMISSOES_GERENCIAR'
                )
            """)
    @GetMapping("/{id}")
    public ResponseEntity<PermissaoResponse> buscar(
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                service.buscarPorId(id));
    }

    @PreAuthorize("hasAuthority('PERMISSOES_GERENCIAR')")
    @PostMapping
    public ResponseEntity<PermissaoResponse> cadastrar(
            @Valid @RequestBody PermissaoRequest request) {
        PermissaoResponse response = service.cadastrar(request);

        return ResponseEntity
                .created(
                        URI.create(
                                "/permissoes/" + response.id()))
                .body(response);
    }

    @PreAuthorize("hasAuthority('PERMISSOES_GERENCIAR')")
    @PutMapping("/{id}")
    public ResponseEntity<PermissaoResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody PermissaoRequest request) {
        return ResponseEntity.ok(
                service.atualizar(id, request));
    }
}