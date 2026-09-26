package rhflow.backend.controller;

import java.net.URI;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import rhflow.backend.dto.UsuarioRequest;
import rhflow.backend.dto.UsuarioResponse;
import rhflow.backend.dto.UsuarioUpdateRequest;
import rhflow.backend.service.UsuarioService;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(
            UsuarioService usuarioService
    ) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/{usuarioId}/perfis/{perfilId}")
    public ResponseEntity<Void> atribuirPerfil(
            @PathVariable UUID usuarioId,
            @PathVariable UUID perfilId
    ) {
        usuarioService.atribuirPerfil(usuarioId, perfilId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{usuarioId}/perfis/{perfilId}")
    public ResponseEntity<Void> removerPerfil(
            @PathVariable UUID usuarioId,
            @PathVariable UUID perfilId
    ) {
        usuarioService.removerPerfil(usuarioId, perfilId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{usuarioId}/permissoes/{permissaoId}")
    public ResponseEntity<Void> concederPermissao(
            @PathVariable UUID usuarioId,
            @PathVariable UUID permissaoId
    ) {
        usuarioService.concederPermissao(
                usuarioId,
                permissaoId
        );

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{usuarioId}/permissoes/{permissaoId}")
    public ResponseEntity<Void> revogarPermissao(
            @PathVariable UUID usuarioId,
            @PathVariable UUID permissaoId
    ) {
        usuarioService.revogarPermissao(
                usuarioId,
                permissaoId
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{usuarioId}/permissoes")
    public ResponseEntity<Set<String>> consultarPermissoes(
            @PathVariable UUID usuarioId
    ) {
        return ResponseEntity.ok(
                usuarioService.consultarPermissoes(usuarioId)
        );
    }
    
    @PostMapping
    public ResponseEntity<UsuarioResponse> cadastrar(
            @Valid @RequestBody UsuarioRequest request) {
        UsuarioResponse usuario = usuarioService.cadastrar(request);

        URI location = URI.create(
                "/usuarios/" + usuario.id());

        return ResponseEntity
                .created(location)
                .body(usuario);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(usuarioService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                usuarioService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody UsuarioUpdateRequest request) {
        return ResponseEntity.ok(
                usuarioService.atualizar(id, request));
    }

    @PatchMapping("/{id}/desativar")
    public ResponseEntity<Void> desativar(
            @PathVariable UUID id) {
        usuarioService.desativar(id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativar(
            @PathVariable UUID id) {
        usuarioService.ativar(id);

        return ResponseEntity.noContent().build();
    }
}