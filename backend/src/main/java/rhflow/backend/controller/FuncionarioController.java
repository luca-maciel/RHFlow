package rhflow.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rhflow.backend.dto.DesligamentoFuncionarioRequest;
import rhflow.backend.dto.FuncionarioRequest;
import rhflow.backend.dto.FuncionarioResponse;
import rhflow.backend.service.FuncionarioService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final FuncionarioService funcionarioService;

    public FuncionarioController(
            FuncionarioService funcionarioService
    ) {
        this.funcionarioService = funcionarioService;
    }

    @PostMapping
    public ResponseEntity<FuncionarioResponse> criar(
            @Valid @RequestBody FuncionarioRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(funcionarioService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<FuncionarioResponse>> listarTodos() {

        return ResponseEntity.ok(
                funcionarioService.listarTodos()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuncionarioResponse> buscarPorId(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                funcionarioService.buscarPorId(id)
        );
    }

    @GetMapping("/cargo/{cargoId}")
    public ResponseEntity<List<FuncionarioResponse>> listarPorCargo(
            @PathVariable UUID cargoId
    ) {

        return ResponseEntity.ok(
                funcionarioService.listarPorCargo(cargoId)
        );
    }

    @GetMapping("/departamento/{departamentoId}")
    public ResponseEntity<List<FuncionarioResponse>> listarPorDepartamento(
            @PathVariable UUID departamentoId
    ) {

        return ResponseEntity.ok(
                funcionarioService.listarPorDepartamento(departamentoId)
        );
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<FuncionarioResponse>> listarPorEmpresa(
            @PathVariable UUID empresaId
    ) {

        return ResponseEntity.ok(
                funcionarioService.listarPorEmpresa(empresaId)
        );
    }

    @PatchMapping("/{id}/desligar")
    public ResponseEntity<FuncionarioResponse> desligar(
            @PathVariable UUID id,
            @Valid @RequestBody DesligamentoFuncionarioRequest request
    ) {

        return ResponseEntity.ok(
                funcionarioService.desligar(id, request)
        );
    }
}