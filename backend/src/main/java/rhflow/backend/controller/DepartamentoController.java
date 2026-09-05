package rhflow.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<DepartamentoResponse> criar(
            @Valid @RequestBody DepartamentoRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(departamentoService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<DepartamentoResponse>> listarTodos() {

        return ResponseEntity.ok(
                departamentoService.listarTodos()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartamentoResponse> buscarPorId(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                departamentoService.buscarPorId(id)
        );
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<DepartamentoResponse>> listarPorEmpresa(
            @PathVariable UUID empresaId
    ) {

        return ResponseEntity.ok(
                departamentoService.listarPorEmpresa(empresaId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable UUID id
    ) {

        departamentoService.desativar(id);

        return ResponseEntity.noContent().build();
    }
}