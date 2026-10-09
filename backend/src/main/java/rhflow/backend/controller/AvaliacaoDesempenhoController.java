package rhflow.backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import rhflow.backend.dto.AvaliacaoDesempenhoRequest;
import rhflow.backend.dto.AvaliacaoDesempenhoResponse;
import rhflow.backend.service.AvaliacaoDesempenhoService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoDesempenhoController {

    private final AvaliacaoDesempenhoService service;

    public AvaliacaoDesempenhoController(
            AvaliacaoDesempenhoService service
    ) {
        this.service = service;
    }

    @PreAuthorize("hasAuthority('AVALIACOES_GERENCIAR')")
    @PostMapping
    public ResponseEntity<AvaliacaoDesempenhoResponse> criar(
            @Valid
            @RequestBody AvaliacaoDesempenhoRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.criar(request));
    }

    @PreAuthorize("hasAnyAuthority('AVALIACOES_VISUALIZAR', 'AVALIACOES_GERENCIAR')")
    @GetMapping
    public ResponseEntity<List<AvaliacaoDesempenhoResponse>>
    listarTodos() {

        return ResponseEntity.ok(
                service.listarTodos()
        );
    }

    @PreAuthorize("hasAnyAuthority('AVALIACOES_VISUALIZAR', 'AVALIACOES_GERENCIAR')")
    @GetMapping("/{id}")
    public ResponseEntity<AvaliacaoDesempenhoResponse>
    buscarPorId(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                service.buscarPorId(id)
        );
    }

    @PreAuthorize("hasAnyAuthority('AVALIACOES_VISUALIZAR', 'AVALIACOES_GERENCIAR')")
    @GetMapping("/funcionario/{funcionarioId}")
    public ResponseEntity<List<AvaliacaoDesempenhoResponse>>
    listarPorFuncionario(
            @PathVariable UUID funcionarioId
    ) {

        return ResponseEntity.ok(
                service.listarPorFuncionario(funcionarioId)
        );
    }

    @PreAuthorize("hasAuthority('AVALIACOES_GERENCIAR')")
    @PutMapping("/{id}")
    public ResponseEntity<AvaliacaoDesempenhoResponse>
    atualizar(
            @PathVariable UUID id,
            @Valid
            @RequestBody AvaliacaoDesempenhoRequest request
    ) {

        return ResponseEntity.ok(
                service.atualizar(id, request)
        );
    }

    @PreAuthorize("hasAuthority('AVALIACOES_GERENCIAR')")
    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<AvaliacaoDesempenhoResponse>
    finalizar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                service.finalizar(id)
        );
    }

    @PreAuthorize("hasAuthority('AVALIACOES_GERENCIAR')")
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<AvaliacaoDesempenhoResponse>
    cancelar(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                service.cancelar(id)
        );
    }
}