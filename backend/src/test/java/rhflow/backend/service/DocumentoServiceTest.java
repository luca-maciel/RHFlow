package rhflow.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import rhflow.backend.dto.DocumentoResponse;
import rhflow.backend.entity.postgresql.Documento;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.entity.postgresql.SolicitacaoDocumento;
import rhflow.backend.entity.postgresql.Usuario;
import rhflow.backend.enums.StatusSolicitacaoDocumento;
import rhflow.backend.enums.TipoDocumento;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.repository.postgresql.DocumentoRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;
import rhflow.backend.repository.postgresql.SolicitacaoDocumentoRepository;
import rhflow.backend.repository.postgresql.UsuarioRepository;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentoServiceTest {

    @Mock
    private DocumentoRepository documentoRepository;

    @Mock
    private SolicitacaoDocumentoRepository solicitacaoRepository;

    @Mock
    private FuncionarioRepository funcionarioRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private DocumentoService documentoService;

    private Funcionario funcionarioDono;
    private UUID funcionarioDonoId;

    @BeforeEach
    void setUp() {
        funcionarioDonoId = UUID.randomUUID();
        funcionarioDono = new Funcionario();
        ReflectionTestUtils.setField(funcionarioDono, "id", funcionarioDonoId);
        funcionarioDono.setNome("Lucas Ferreira");
    }

    @Test
    @DisplayName("Deve enviar documento e concluir solicitação pendente vinculada")
    void deveEnviarDocumentoEConcluirSolicitacao() {
        UUID solicitacaoId = UUID.randomUUID();
        SolicitacaoDocumento solicitacao = new SolicitacaoDocumento();
        ReflectionTestUtils.setField(solicitacao, "id", solicitacaoId);
        solicitacao.setFuncionario(funcionarioDono);
        solicitacao.setTipoDocumento(TipoDocumento.DECLARACAO_VINCULO);
        solicitacao.setStatus(StatusSolicitacaoDocumento.PENDENTE);

        MockMultipartFile arquivo = new MockMultipartFile(
                "arquivo",
                "declaracao.pdf",
                "application/pdf",
                "conteudo-pdf".getBytes()
        );

        when(funcionarioRepository.findById(funcionarioDonoId)).thenReturn(Optional.of(funcionarioDono));
        when(solicitacaoRepository.findById(solicitacaoId)).thenReturn(Optional.of(solicitacao));
        when(storageService.armazenar(arquivo)).thenReturn("uuid-declaracao.pdf");
        when(documentoRepository.save(any(Documento.class))).thenAnswer(inv -> {
            Documento doc = inv.getArgument(0);
            ReflectionTestUtils.setField(doc, "id", UUID.randomUUID());
            return doc;
        });

        DocumentoResponse response = documentoService.enviarDocumento(
                funcionarioDonoId,
                "Declaração de Vínculo",
                TipoDocumento.DECLARACAO_VINCULO,
                "Emitido pelo RH",
                solicitacaoId,
                arquivo
        );

        assertNotNull(response);
        assertEquals("Declaração de Vínculo", response.titulo());
        assertEquals(StatusSolicitacaoDocumento.CONCLUIDA, solicitacao.getStatus());
        verify(solicitacaoRepository, times(1)).save(solicitacao);
        verify(auditoriaService, times(1)).registrar(eq("ATENDER_SOLICITACAO_DOCUMENTO"), any(), any(), any(), anyMap());
        verify(auditoriaService, times(1)).registrar(eq("ENVIAR_DOCUMENTO"), any(), any(), any(), anyMap());
    }

    @Test
    @DisplayName("Deve bloquear download quando colaborador tenta baixar documento de outro funcionário")
    void deveBloquearDownloadDeOutroColaborador() {
        UUID documentoId = UUID.randomUUID();
        Documento documento = new Documento();
        ReflectionTestUtils.setField(documento, "id", documentoId);
        documento.setFuncionario(funcionarioDono);
        documento.setAtivo(true);

        Funcionario outroFuncionario = new Funcionario();
        ReflectionTestUtils.setField(outroFuncionario, "id", UUID.randomUUID());

        UUID outroUsuarioId = UUID.randomUUID();
        Usuario outroUsuario = new Usuario();
        outroUsuario.setFuncionario(outroFuncionario);

        when(documentoRepository.findById(documentoId)).thenReturn(Optional.of(documento));
        when(usuarioRepository.findById(outroUsuarioId)).thenReturn(Optional.of(outroUsuario));

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> documentoService.prepararDownload(documentoId, outroUsuarioId, false)
        );

        assertEquals("Você não possui permissão para baixar este documento.", ex.getMessage());
        verify(storageService, never()).carregarComoResource(any());
    }
}