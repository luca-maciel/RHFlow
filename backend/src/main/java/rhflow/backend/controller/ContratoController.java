package rhflow.backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import rhflow.backend.dto.ContratoRequest;
import rhflow.backend.dto.ContratoResponse;
import rhflow.backend.dto.EncerramentoContratoRequest;
import rhflow.backend.service.ContratoService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contratos")
public class ContratoController {

    private final ContratoService contratoService;

    public ContratoController(
            ContratoService contratoService
    ) {
        this.contratoService = contratoService;
    }

    @PostMapping
    public ResponseEntity<ContratoResponse> criar(
            @Valid @RequestBody ContratoRequest request
    ) {

        ContratoResponse response =
                contratoService.criar(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ContratoResponse>> listarTodos() {

        return ResponseEntity.ok(
                contratoService.listarTodos()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContratoResponse> buscarPorId(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                contratoService.buscarPorId(id)
        );
    }

    @GetMapping("/funcionario/{funcionarioId}")
    public ResponseEntity<List<ContratoResponse>>
    listarPorFuncionario(
            @PathVariable UUID funcionarioId
    ) {

        return ResponseEntity.ok(
                contratoService.listarPorFuncionario(
                        funcionarioId
                )
        );
    }

    @PatchMapping("/{id}/encerrar")
    public ResponseEntity<ContratoResponse> encerrar(
            @PathVariable UUID id,
            @Valid @RequestBody
            EncerramentoContratoRequest request
    ) {

        return ResponseEntity.ok(
                contratoService.encerrar(id, request)
        );
    }
}