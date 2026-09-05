package rhflow.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rhflow.backend.dto.CargoRequest;
import rhflow.backend.dto.CargoResponse;
import rhflow.backend.service.CargoService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cargos")
public class CargoController {

    private final CargoService cargoService;

    public CargoController(CargoService cargoService) {
        this.cargoService = cargoService;
    }

    @PostMapping
    public ResponseEntity<CargoResponse> criar(
            @Valid @RequestBody CargoRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(cargoService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<CargoResponse>> listarTodos() {

        return ResponseEntity.ok(
                cargoService.listarTodos()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CargoResponse> buscarPorId(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                cargoService.buscarPorId(id)
        );
    }

    @GetMapping("/departamento/{departamentoId}")
    public ResponseEntity<List<CargoResponse>> listarPorDepartamento(
            @PathVariable UUID departamentoId
    ) {

        return ResponseEntity.ok(
                cargoService.listarPorDepartamento(departamentoId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable UUID id
    ) {

        cargoService.desativar(id);

        return ResponseEntity.noContent().build();
    }
}