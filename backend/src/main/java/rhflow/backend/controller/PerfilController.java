package rhflow.backend.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<PerfilResponse> cadastrar(
            @Valid @RequestBody PerfilRequest request
    ) {
        PerfilResponse response = service.cadastrar(request);

        return ResponseEntity
                .created(URI.create("/perfis/" + response.id()))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<PerfilResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerfilResponse> buscar(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PerfilResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody PerfilRequest request
    ) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @PostMapping("/{perfilId}/permissoes/{permissaoId}")
    public ResponseEntity<Void> atribuirPermissao(
            @PathVariable UUID perfilId,
            @PathVariable UUID permissaoId
    ) {
        service.atribuirPermissao(perfilId, permissaoId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{perfilId}/permissoes/{permissaoId}")
    public ResponseEntity<Void> removerPermissao(
            @PathVariable UUID perfilId,
            @PathVariable UUID permissaoId
    ) {
        service.removerPermissao(perfilId, permissaoId);

        return ResponseEntity.noContent().build();
    }
}