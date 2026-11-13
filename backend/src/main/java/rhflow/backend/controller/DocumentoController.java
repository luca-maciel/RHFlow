package rhflow.backend.controller;

import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import rhflow.backend.dto.DocumentoResponse;
import rhflow.backend.dto.SolicitacaoDocumentoRequest;
import rhflow.backend.dto.SolicitacaoDocumentoResponse;
import rhflow.backend.enums.TipoDocumento;
import rhflow.backend.service.DocumentoService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/documentos")
public class DocumentoController {

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @PreAuthorize("hasAuthority('DOCUMENTOS_GERENCIAR')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentoResponse> uploadDocumento(
            @RequestParam("funcionarioId") UUID funcionarioId,
            @RequestParam("titulo") String titulo,
            @RequestParam("tipo") TipoDocumento tipo,
            @RequestParam(value = "observacao", required = false) String observacao,
            @RequestParam(value = "solicitacaoId", required = false) UUID solicitacaoId,
            @RequestPart("arquivo") MultipartFile arquivo) {

        DocumentoResponse response = documentoService.enviarDocumento(
                funcionarioId, titulo, tipo, observacao, solicitacaoId, arquivo);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyAuthority('DOCUMENTOS_VISUALIZAR', 'DOCUMENTOS_GERENCIAR')")
    @GetMapping
    public ResponseEntity<List<DocumentoResponse>> listarTodos() {
        return ResponseEntity.ok(documentoService.listarTodosDocumentos());
    }

    @PreAuthorize("hasAnyAuthority('DOCUMENTOS_SOLICITAR', 'DOCUMENTOS_GERENCIAR')")
    @GetMapping("/meus")
    public ResponseEntity<List<DocumentoResponse>> listarMeusDocumentos(
            @AuthenticationPrincipal Jwt jwt) {
        UUID usuarioId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(documentoService.listarMeusDocumentos(usuarioId));
    }

    @PreAuthorize("hasAnyAuthority('DOCUMENTOS_VISUALIZAR', 'DOCUMENTOS_SOLICITAR', 'DOCUMENTOS_GERENCIAR')")
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocumento(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication) {

        UUID usuarioId = UUID.fromString(jwt.getSubject());
        boolean acessoGerencial = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("DOCUMENTOS_VISUALIZAR")
                        || a.getAuthority().equals("DOCUMENTOS_GERENCIAR"));

        var download = documentoService.prepararDownload(id, usuarioId, acessoGerencial);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + download.nomeOriginal().replace("\"", "_") + "\""
                )
                .body(download.resource());
    }

    @PreAuthorize("hasAuthority('DOCUMENTOS_GERENCIAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable UUID id) {
        documentoService.desativarDocumento(id);
        return ResponseEntity.noContent().build();
    }

    // --- SOLICITAÇÕES ---

    @PreAuthorize("hasAnyAuthority('DOCUMENTOS_SOLICITAR', 'DOCUMENTOS_GERENCIAR')")
    @PostMapping("/solicitacoes/minhas")
    public ResponseEntity<SolicitacaoDocumentoResponse> criarSolicitacao(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SolicitacaoDocumentoRequest request) {
        UUID usuarioId = UUID.fromString(jwt.getSubject());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(documentoService.solicitarDocumento(usuarioId, request));
    }

    @PreAuthorize("hasAnyAuthority('DOCUMENTOS_SOLICITAR', 'DOCUMENTOS_GERENCIAR')")
    @GetMapping("/solicitacoes/minhas")
    public ResponseEntity<List<SolicitacaoDocumentoResponse>> listarMinhasSolicitacoes(
            @AuthenticationPrincipal Jwt jwt) {
        UUID usuarioId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(documentoService.listarMinhasSolicitacoes(usuarioId));
    }

    @PreAuthorize("hasAnyAuthority('DOCUMENTOS_VISUALIZAR', 'DOCUMENTOS_GERENCIAR')")
    @GetMapping("/solicitacoes")
    public ResponseEntity<List<SolicitacaoDocumentoResponse>> listarTodasSolicitacoes() {
        return ResponseEntity.ok(documentoService.listarTodasSolicitacoes());
    }

    @PreAuthorize("hasAuthority('DOCUMENTOS_GERENCIAR')")
    @PatchMapping("/solicitacoes/{id}/rejeitar")
    public ResponseEntity<SolicitacaoDocumentoResponse> rejeitarSolicitacao(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String motivo = body != null ? body.get("motivo") : null;
        return ResponseEntity.ok(documentoService.rejeitarSolicitacao(id, motivo));
    }

    @PreAuthorize("hasAnyAuthority('DOCUMENTOS_SOLICITAR', 'DOCUMENTOS_GERENCIAR')")
    @PatchMapping("/solicitacoes/{id}/cancelar")
    public ResponseEntity<SolicitacaoDocumentoResponse> cancelarMinhaSolicitacao(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID usuarioId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(documentoService.cancelarMinhaSolicitacao(id, usuarioId));
    }
}