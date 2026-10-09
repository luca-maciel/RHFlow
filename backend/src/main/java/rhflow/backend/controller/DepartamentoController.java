package rhflow.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rhflow.backend.dto.DepartamentoRequest;
import rhflow.backend.dto.DepartamentoResponse;
import rhflow.backend.service.DepartamentoService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/departamentos")
public class DepartamentoController {

    private final DepartamentoService departamentoService;

    public DepartamentoController(
            DepartamentoService departamentoService
    ) {
        this.departamentoService = departamentoService;
    }

    @PreAuthorize("hasAuthority('DEPARTAMENTOS_GERENCIAR')")
    @PostMapping
    public ResponseEntity<DepartamentoResponse> criar(
            @Valid @RequestBody DepartamentoRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(departamentoService.criar(request));
    }

    @PreAuthorize("hasAnyAuthority('DEPARTAMENTOS_VISUALIZAR', 'DEPARTAMENTOS_GERENCIAR')")
    @GetMapping
    public ResponseEntity<List<DepartamentoResponse>> listarTodos() {

        return ResponseEntity.ok(
                departamentoService.listarTodos()
        );
    }

    @PreAuthorize("hasAnyAuthority('DEPARTAMENTOS_VISUALIZAR', 'DEPARTAMENTOS_GERENCIAR')")
    @GetMapping("/{id}")
    public ResponseEntity<DepartamentoResponse> buscarPorId(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                departamentoService.buscarPorId(id)
        );
    }

    @PreAuthorize("hasAnyAuthority('DEPARTAMENTOS_VISUALIZAR', 'DEPARTAMENTOS_GERENCIAR')")
    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<DepartamentoResponse>> listarPorEmpresa(
            @PathVariable UUID empresaId
    ) {

        return ResponseEntity.ok(
                departamentoService.listarPorEmpresa(empresaId)
        );
    }

    @PreAuthorize("hasAuthority('DEPARTAMENTOS_GERENCIAR')")
    @PutMapping("/{id}")
    public ResponseEntity<DepartamentoResponse> atualizar(
                    @PathVariable UUID id,
                    @Valid @RequestBody DepartamentoRequest request) {
            return ResponseEntity.ok(
                            departamentoService.atualizar(id, request));
    }

    @PreAuthorize("hasAuthority('DEPARTAMENTOS_GERENCIAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable UUID id
    ) {

        departamentoService.desativar(id);

        return ResponseEntity.noContent().build();
    }
}