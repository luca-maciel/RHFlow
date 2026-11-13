package rhflow.backend.service;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import rhflow.backend.dto.DocumentoResponse;
import rhflow.backend.dto.SolicitacaoDocumentoRequest;
import rhflow.backend.dto.SolicitacaoDocumentoResponse;
import rhflow.backend.entity.postgresql.Documento;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.entity.postgresql.SolicitacaoDocumento;
import rhflow.backend.entity.postgresql.Usuario;
import rhflow.backend.enums.StatusSolicitacaoDocumento;
import rhflow.backend.enums.TipoDocumento;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.DocumentoRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;
import rhflow.backend.repository.postgresql.SolicitacaoDocumentoRepository;
import rhflow.backend.repository.postgresql.UsuarioRepository;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DocumentoService {

    private final DocumentoRepository documentoRepository;
    private final SolicitacaoDocumentoRepository solicitacaoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final StorageService storageService;

    public DocumentoService(
            DocumentoRepository documentoRepository,
            SolicitacaoDocumentoRepository solicitacaoRepository,
            FuncionarioRepository funcionarioRepository,
            UsuarioRepository usuarioRepository,
            StorageService storageService) {
        this.documentoRepository = documentoRepository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.storageService = storageService;
    }

    public DocumentoResponse enviarDocumento(
            UUID funcionarioId,
            String titulo,
            TipoDocumento tipo,
            String observacao,
            UUID solicitacaoId,
            MultipartFile arquivo) {

        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado."));

        if (titulo == null || titulo.isBlank()) {
            throw new BusinessException("O título do documento é obrigatório.");
        }

        SolicitacaoDocumento solicitacao = null;
        if (solicitacaoId != null) {
            solicitacao = solicitacaoRepository.findById(solicitacaoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Solicitação de documento não encontrada."));

            if (!solicitacao.getFuncionario().getId().equals(funcionario.getId())) {
                throw new BusinessException("A solicitação informada pertence a outro funcionário.");
            }
            if (solicitacao.getStatus() != StatusSolicitacaoDocumento.PENDENTE) {
                throw new BusinessException("Somente solicitações pendentes podem ser atendidas.");
            }
        }

        String nomeArmazenado = storageService.armazenar(arquivo);

        Documento documento = new Documento();
        documento.setFuncionario(funcionario);
        documento.setSolicitacao(solicitacao);
        documento.setTitulo(titulo.trim());
        documento.setTipo(tipo);
        documento.setNomeArquivoOriginal(arquivo.getOriginalFilename() != null ? arquivo.getOriginalFilename() : "documento");
        documento.setCaminhoArquivo(nomeArmazenado);
        documento.setContentType(arquivo.getContentType() != null ? arquivo.getContentType() : "application/octet-stream");
        documento.setTamanhoBytes(arquivo.getSize());
        documento.setObservacao(observacao != null && !observacao.isBlank() ? observacao.trim() : null);

        Documento salvo = documentoRepository.save(documento);

        if (solicitacao != null) {
            solicitacao.setStatus(StatusSolicitacaoDocumento.CONCLUIDA);
            solicitacao.setDocumento(salvo);
            solicitacaoRepository.save(solicitacao);
        }

        return toDocumentoResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarTodosDocumentos() {
        return documentoRepository.findByAtivoTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toDocumentoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarMeusDocumentos(UUID usuarioId) {
        Funcionario funcionario = buscarFuncionarioDoUsuario(usuarioId);
        return documentoRepository.findByFuncionarioIdAndAtivoTrueOrderByCreatedAtDesc(funcionario.getId())
                .stream()
                .map(this::toDocumentoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentoArquivoDownload prepararDownload(UUID documentoId, UUID usuarioId, boolean acessoGerencial) {
        Documento documento = documentoRepository.findById(documentoId)
                .filter(Documento::isAtivo)
                .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado."));

        if (!acessoGerencial) {
            Funcionario funcionario = buscarFuncionarioDoUsuario(usuarioId);
            if (!documento.getFuncionario().getId().equals(funcionario.getId())) {
                throw new BusinessException("Você não possui permissão para baixar este documento.");
            }
        }

        Resource resource = storageService.carregarComoResource(documento.getCaminhoArquivo());
        return new DocumentoArquivoDownload(
                resource,
                documento.getNomeArquivoOriginal(),
                documento.getContentType()
        );
    }

    public void desativarDocumento(UUID documentoId) {
        Documento documento = documentoRepository.findById(documentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado."));
        documento.setAtivo(false);
        documentoRepository.save(documento);
    }

    // --- SOLICITAÇÕES INTERNAS DE DOCUMENTOS ---

    public SolicitacaoDocumentoResponse solicitarDocumento(UUID usuarioId, SolicitacaoDocumentoRequest request) {
        Funcionario funcionario = buscarFuncionarioDoUsuario(usuarioId);

        SolicitacaoDocumento solicitacao = new SolicitacaoDocumento();
        solicitacao.setFuncionario(funcionario);
        solicitacao.setTipoDocumento(request.getTipoDocumento());
        solicitacao.setJustificativa(
                request.getJustificativa() != null && !request.getJustificativa().isBlank()
                        ? request.getJustificativa().trim()
                        : null
        );
        solicitacao.setStatus(StatusSolicitacaoDocumento.PENDENTE);

        return toSolicitacaoResponse(solicitacaoRepository.save(solicitacao));
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoDocumentoResponse> listarTodasSolicitacoes() {
        return solicitacaoRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toSolicitacaoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoDocumentoResponse> listarMinhasSolicitacoes(UUID usuarioId) {
        Funcionario funcionario = buscarFuncionarioDoUsuario(usuarioId);
        return solicitacaoRepository.findByFuncionarioIdOrderByCreatedAtDesc(funcionario.getId())
                .stream()
                .map(this::toSolicitacaoResponse)
                .toList();
    }

    public SolicitacaoDocumentoResponse rejeitarSolicitacao(UUID id, String motivo) {
        SolicitacaoDocumento solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada."));

        if (solicitacao.getStatus() != StatusSolicitacaoDocumento.PENDENTE) {
            throw new BusinessException("Somente solicitações pendentes podem ser rejeitadas.");
        }

        solicitacao.setStatus(StatusSolicitacaoDocumento.REJEITADA);
        solicitacao.setMotivoRejeicao(motivo != null && !motivo.isBlank() ? motivo.trim() : null);
        return toSolicitacaoResponse(solicitacaoRepository.save(solicitacao));
    }

    public SolicitacaoDocumentoResponse cancelarMinhaSolicitacao(UUID id, UUID usuarioId) {
        Funcionario funcionario = buscarFuncionarioDoUsuario(usuarioId);
        SolicitacaoDocumento solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada."));

        if (!solicitacao.getFuncionario().getId().equals(funcionario.getId())) {
            throw new BusinessException("Você não pode cancelar a solicitação de outro colaborador.");
        }

        if (solicitacao.getStatus() != StatusSolicitacaoDocumento.PENDENTE) {
            throw new BusinessException("Somente solicitações pendentes podem ser canceladas.");
        }

        solicitacao.setStatus(StatusSolicitacaoDocumento.CANCELADA);
        return toSolicitacaoResponse(solicitacaoRepository.save(solicitacao));
    }

    private Funcionario buscarFuncionarioDoUsuario(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        if (usuario.getFuncionario() == null) {
            throw new BusinessException("O usuário autenticado não está vinculado a um funcionário.");
        }
        return usuario.getFuncionario();
    }

    private DocumentoResponse toDocumentoResponse(Documento doc) {
        return new DocumentoResponse(
                doc.getId(),
                doc.getFuncionario().getId(),
                doc.getFuncionario().getNome(),
                doc.getSolicitacao() != null ? doc.getSolicitacao().getId() : null,
                doc.getTitulo(),
                doc.getTipo(),
                doc.getNomeArquivoOriginal(),
                doc.getContentType(),
                doc.getTamanhoBytes(),
                doc.getObservacao(),
                doc.getCreatedAt()
        );
    }

    private SolicitacaoDocumentoResponse toSolicitacaoResponse(SolicitacaoDocumento sol) {
        return new SolicitacaoDocumentoResponse(
                sol.getId(),
                sol.getFuncionario().getId(),
                sol.getFuncionario().getNome(),
                sol.getTipoDocumento(),
                sol.getJustificativa(),
                sol.getStatus(),
                sol.getMotivoRejeicao(),
                sol.getDocumento() != null ? sol.getDocumento().getId() : null,
                sol.getDocumento() != null ? sol.getDocumento().getTitulo() : null,
                sol.getCreatedAt(),
                sol.getUpdatedAt()
        );
    }

    public record DocumentoArquivoDownload(
            Resource resource,
            String nomeOriginal,
            String contentType
    ) {
    }
}