package rhflow.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rhflow.backend.dto.EmpresaRequest;
import rhflow.backend.dto.EmpresaResponse;
import rhflow.backend.service.EmpresaService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    @PostMapping
    public ResponseEntity<EmpresaResponse> criar(
            @Valid @RequestBody EmpresaRequest request
    ) {

        EmpresaResponse empresa = empresaService.criar(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(empresa);
    }

    @GetMapping
    public ResponseEntity<List<EmpresaResponse>> listarTodas() {
        return ResponseEntity.ok(empresaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaResponse> buscarPorId(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(empresaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody EmpresaRequest request
    ) {
        return ResponseEntity.ok(empresaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable UUID id
    ) {

        empresaService.desativar(id);

        return ResponseEntity.noContent().build();
    }
}