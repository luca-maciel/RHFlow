package rhflow.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rhflow.backend.dto.EnderecoRequest;
import rhflow.backend.dto.EnderecoResponse;
import rhflow.backend.service.EnderecoService;

import java.util.UUID;

@RestController
@RequestMapping("/enderecos")
public class EnderecoController {

    private final EnderecoService enderecoService;

    public EnderecoController(
            EnderecoService enderecoService
    ) {
        this.enderecoService = enderecoService;
    }

    @PostMapping
    public ResponseEntity<EnderecoResponse> criar(
            @Valid @RequestBody EnderecoRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(enderecoService.criar(request));
    }

    @GetMapping("/funcionario/{funcionarioId}")
    public ResponseEntity<EnderecoResponse> buscarPorFuncionario(
            @PathVariable UUID funcionarioId
    ) {

        return ResponseEntity.ok(
                enderecoService.buscarPorFuncionario(funcionarioId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnderecoResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody EnderecoRequest request
    ) {

        return ResponseEntity.ok(
                enderecoService.atualizar(id, request)
        );
    }
}