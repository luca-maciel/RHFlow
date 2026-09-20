package rhflow.backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import rhflow.backend.dto.EncerramentoBeneficioRequest;
import rhflow.backend.dto.FuncionarioBeneficioRequest;
import rhflow.backend.dto.FuncionarioBeneficioResponse;
import rhflow.backend.service.FuncionarioBeneficioService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/funcionarios-beneficios")
public class FuncionarioBeneficioController {

    private final FuncionarioBeneficioService service;

    public FuncionarioBeneficioController(
            FuncionarioBeneficioService service
    ) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<FuncionarioBeneficioResponse> atribuir(
            @Valid @RequestBody FuncionarioBeneficioRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.atribuir(request));
    }

    @GetMapping("/funcionario/{funcionarioId}")
    public ResponseEntity<List<FuncionarioBeneficioResponse>>
    listarPorFuncionario(
            @PathVariable UUID funcionarioId
    ) {

        return ResponseEntity.ok(
                service.listarPorFuncionario(funcionarioId)
        );
    }

    @GetMapping("/funcionario/{funcionarioId}/ativos")
    public ResponseEntity<List<FuncionarioBeneficioResponse>>
    listarAtivosPorFuncionario(
            @PathVariable UUID funcionarioId
    ) {

        return ResponseEntity.ok(
                service.listarAtivosPorFuncionario(funcionarioId)
        );
    }

    @PatchMapping("/{id}/encerrar")
    public ResponseEntity<FuncionarioBeneficioResponse> encerrar(
            @PathVariable UUID id,
            @Valid @RequestBody
            EncerramentoBeneficioRequest request
    ) {

        return ResponseEntity.ok(
                service.encerrar(id, request)
        );
    }
}