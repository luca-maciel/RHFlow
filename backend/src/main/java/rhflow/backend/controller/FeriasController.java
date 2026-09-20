package rhflow.backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import rhflow.backend.dto.FeriasRequest;
import rhflow.backend.dto.FeriasResponse;
import rhflow.backend.service.FeriasService;

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

    @GetMapping
    public ResponseEntity<List<FeriasResponse>> listarTodos() {

        return ResponseEntity.ok(
                feriasService.listarTodos()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeriasResponse> buscarPorId(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.buscarPorId(id)
        );
    }

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

    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<FeriasResponse> aprovar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.aprovar(id)
        );
    }

    @PatchMapping("/{id}/rejeitar")
    public ResponseEntity<FeriasResponse> rejeitar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.rejeitar(id)
        );
    }

    @PatchMapping("/{id}/iniciar")
    public ResponseEntity<FeriasResponse> iniciar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.iniciar(id)
        );
    }

    @PatchMapping("/{id}/concluir")
    public ResponseEntity<FeriasResponse> concluir(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.concluir(id)
        );
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<FeriasResponse> cancelar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                feriasService.cancelar(id)
        );
    }
}