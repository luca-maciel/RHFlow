package rhflow.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rhflow.backend.dto.DesligamentoFuncionarioRequest;
import rhflow.backend.dto.FuncionarioRequest;
import rhflow.backend.dto.ReativacaoFuncionarioRequest;
import rhflow.backend.dto.FuncionarioResponse;
import rhflow.backend.enums.StatusFuncionario;
import rhflow.backend.service.FuncionarioService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

        private final FuncionarioService funcionarioService;

        public FuncionarioController(
                        FuncionarioService funcionarioService) {
                this.funcionarioService = funcionarioService;
        }

        @PreAuthorize("hasAuthority('FUNCIONARIOS_GERENCIAR')")
        @PostMapping
        public ResponseEntity<FuncionarioResponse> criar(
                        @Valid @RequestBody FuncionarioRequest request) {

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(funcionarioService.criar(request));
        }

        @PreAuthorize("hasAnyAuthority('FUNCIONARIOS_VISUALIZAR', 'FUNCIONARIOS_GERENCIAR')")
        @GetMapping
        public ResponseEntity<List<FuncionarioResponse>> listarTodos() {

                return ResponseEntity.ok(
                                funcionarioService.listarTodos());
        }

        @PreAuthorize("hasAnyAuthority('FUNCIONARIOS_VISUALIZAR', 'FUNCIONARIOS_GERENCIAR')")
        @GetMapping("/{id}")
        public ResponseEntity<FuncionarioResponse> buscarPorId(
                        @PathVariable UUID id) {

                return ResponseEntity.ok(
                                funcionarioService.buscarPorId(id));
        }

        @PreAuthorize("hasAnyAuthority('FUNCIONARIOS_VISUALIZAR', 'FUNCIONARIOS_GERENCIAR')")
        @GetMapping("/cargo/{cargoId}")
        public ResponseEntity<List<FuncionarioResponse>> listarPorCargo(
                        @PathVariable UUID cargoId) {

                return ResponseEntity.ok(
                                funcionarioService.listarPorCargo(cargoId));
        }

        @PreAuthorize("hasAnyAuthority('FUNCIONARIOS_VISUALIZAR', 'FUNCIONARIOS_GERENCIAR')")
        @GetMapping("/departamento/{departamentoId}")
        public ResponseEntity<List<FuncionarioResponse>> listarPorDepartamento(
                        @PathVariable UUID departamentoId) {

                return ResponseEntity.ok(
                                funcionarioService.listarPorDepartamento(departamentoId));
        }

        @PreAuthorize("hasAnyAuthority('FUNCIONARIOS_VISUALIZAR', 'FUNCIONARIOS_GERENCIAR')")
        @GetMapping("/empresa/{empresaId}")
        public ResponseEntity<List<FuncionarioResponse>> listarPorEmpresa(
                        @PathVariable UUID empresaId) {

                return ResponseEntity.ok(
                                funcionarioService.listarPorEmpresa(empresaId));
        }

        @PreAuthorize("hasAuthority('FUNCIONARIOS_GERENCIAR')")
        @PutMapping("/{id}")
        public ResponseEntity<FuncionarioResponse> atualizar(
                        @PathVariable UUID id,
                        @Valid @RequestBody FuncionarioRequest request) {
                return ResponseEntity.ok(
                                funcionarioService.atualizar(id, request));
        }

        @PreAuthorize("hasAuthority('FUNCIONARIOS_GERENCIAR')")
        @PatchMapping("/{id}/desligar")
        public ResponseEntity<FuncionarioResponse> desligar(
                        @PathVariable UUID id,
                        @Valid @RequestBody DesligamentoFuncionarioRequest request) {

                return ResponseEntity.ok(
                                funcionarioService.desligar(id, request));
        }
        
        @PreAuthorize("hasAuthority('FUNCIONARIOS_GERENCIAR')")
        @PatchMapping("/{id}/reativar")
        public ResponseEntity<FuncionarioResponse> reativar(
                        @PathVariable UUID id,
                        @Valid @RequestBody ReativacaoFuncionarioRequest request) {
                return ResponseEntity.ok(funcionarioService.reativar(id, request));
        }

        @PreAuthorize("hasAnyAuthority('FUNCIONARIOS_VISUALIZAR', 'FUNCIONARIOS_GERENCIAR')")
        @GetMapping("/status/{status}/count")
        public ResponseEntity<Long> contarPorStatus(
                        @PathVariable StatusFuncionario status) {
                return ResponseEntity.ok(
                                funcionarioService.contarPorStatus(status));
        }
}