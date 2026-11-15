package rhflow.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rhflow.backend.entity.mongodb.AuditoriaEvento;
import rhflow.backend.service.AuditoriaService;

import java.util.List;

@RestController
@RequestMapping("/auditoria")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    public AuditoriaController(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @PreAuthorize("hasAuthority('AUDITORIA_VISUALIZAR')")
    @GetMapping
    public ResponseEntity<List<AuditoriaEvento>> listarRecentes() {
        return ResponseEntity.ok(auditoriaService.listarRecentes());
    }
}