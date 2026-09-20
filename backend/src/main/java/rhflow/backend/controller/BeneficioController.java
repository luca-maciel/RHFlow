package rhflow.backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import rhflow.backend.dto.BeneficioRequest;
import rhflow.backend.dto.BeneficioResponse;
import rhflow.backend.service.BeneficioService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/beneficios")
public class BeneficioController {

    private final BeneficioService beneficioService;

    public BeneficioController(
            BeneficioService beneficioService
    ) {
        this.beneficioService = beneficioService;
    }

    @PostMapping
    public ResponseEntity<BeneficioResponse> criar(
            @Valid @RequestBody BeneficioRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(beneficioService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<BeneficioResponse>> listarTodos() {

        return ResponseEntity.ok(
                beneficioService.listarTodos()
        );
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<BeneficioResponse>> listarAtivos() {

        return ResponseEntity.ok(
                beneficioService.listarAtivos()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BeneficioResponse> buscarPorId(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                beneficioService.buscarPorId(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<BeneficioResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody BeneficioRequest request
    ) {

        return ResponseEntity.ok(
                beneficioService.atualizar(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BeneficioResponse> desativar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                beneficioService.desativar(id)
        );
    }
}