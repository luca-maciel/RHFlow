package rhflow.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import rhflow.backend.dto.HistoricoSalarialRequest;
import rhflow.backend.dto.HistoricoSalarialResponse;
import rhflow.backend.service.HistoricoSalarialService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/historicos-salariais")
public class HistoricoSalarialController {

    private final HistoricoSalarialService service;

    public HistoricoSalarialController(
            HistoricoSalarialService service
    ) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<HistoricoSalarialResponse> criar(
            @Valid @RequestBody
            HistoricoSalarialRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.criar(request));
    }

    @GetMapping("/funcionario/{funcionarioId}")
    public ResponseEntity<List<HistoricoSalarialResponse>>
    listarPorFuncionario(
            @PathVariable UUID funcionarioId
    ) {

        return ResponseEntity.ok(
                service.listarPorFuncionario(
                        funcionarioId
                )
        );
    }

    @GetMapping("/contrato/{contratoId}")
    public ResponseEntity<List<HistoricoSalarialResponse>>
    listarPorContrato(
            @PathVariable UUID contratoId
    ) {

        return ResponseEntity.ok(
                service.listarPorContrato(
                        contratoId
                )
        );
    }

    @GetMapping("/funcionario/{funcionarioId}/atual")
    public ResponseEntity<HistoricoSalarialResponse>
    buscarAtual(
            @PathVariable UUID funcionarioId
    ) {

        return ResponseEntity.ok(
                service.buscarSalarioAtual(
                        funcionarioId
                )
        );
    }
}