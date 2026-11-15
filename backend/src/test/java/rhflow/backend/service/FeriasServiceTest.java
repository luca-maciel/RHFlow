package rhflow.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import rhflow.backend.dto.FeriasRequest;
import rhflow.backend.dto.FeriasResponse;
import rhflow.backend.entity.postgresql.Ferias;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.enums.StatusFerias;
import rhflow.backend.enums.StatusFuncionario;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.repository.postgresql.FeriasRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;
import rhflow.backend.repository.postgresql.UsuarioRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeriasServiceTest {

    @Mock
    private FeriasRepository feriasRepository;

    @Mock
    private FuncionarioRepository funcionarioRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private FeriasService feriasService;

    private Funcionario funcionario;
    private UUID funcionarioId;

    @BeforeEach
    void setUp() {
        funcionarioId = UUID.randomUUID();
        funcionario = new Funcionario();
        ReflectionTestUtils.setField(funcionario, "id", funcionarioId);
        funcionario.setNome("Lucas Ferreira");
        funcionario.setAtivo(true);
        funcionario.setStatus(StatusFuncionario.ATIVO);
        funcionario.setDataAdmissao(LocalDate.of(2025, 5, 5));
    }

    @Test
    @DisplayName("Deve criar solicitação de férias válida dentro do período concessivo")
    void deveSolicitarFeriasComSucesso() {
        FeriasRequest request = new FeriasRequest();
        request.setFuncionarioId(funcionarioId);
        request.setInicioGozo(LocalDate.of(2026, 12, 1));
        request.setFimGozo(LocalDate.of(2026, 12, 15));
        request.setObservacao("Descanso de fim de ano");

        when(funcionarioRepository.findById(funcionarioId)).thenReturn(Optional.of(funcionario));
        when(feriasRepository.sumDiasUtilizadosNoPeriodo(eq(funcionarioId), any(), any(), anyList())).thenReturn(0);
        when(feriasRepository.existsPeriodoSobreposto(eq(funcionarioId), any(), any(), anyList())).thenReturn(false);
        when(feriasRepository.save(any(Ferias.class))).thenAnswer(invocation -> {
            Ferias f = invocation.getArgument(0);
            ReflectionTestUtils.setField(f, "id", UUID.randomUUID());
            return f;
        });

        FeriasResponse response = feriasService.solicitar(request);

        assertNotNull(response);
        assertEquals(15, response.getQuantidadeDias());
        assertEquals(StatusFerias.SOLICITADA, response.getStatus());
        assertEquals(LocalDate.of(2025, 5, 5), response.getInicioPeriodoAquisitivo());
        assertEquals(LocalDate.of(2026, 5, 4), response.getFimPeriodoAquisitivo());
        verify(auditoriaService, times(1)).registrar(eq("SOLICITAR_FERIAS"), eq("FERIAS"), any(), any(), anyMap());
    }

    @Test
    @DisplayName("Deve bloquear solicitação antes de completar 12 meses do período aquisitivo")
    void deveBloquearDireitoAdquiridoIncompleto() {
        FeriasRequest request = new FeriasRequest();
        request.setFuncionarioId(funcionarioId);
        request.setInicioGozo(LocalDate.of(2026, 3, 1));
        request.setFimGozo(LocalDate.of(2026, 3, 15));

        when(funcionarioRepository.findById(funcionarioId)).thenReturn(Optional.of(funcionario));

        BusinessException ex = assertThrows(BusinessException.class, () -> feriasService.solicitar(request));
        assertTrue(ex.getMessage().contains("Direito adquirido incompleto"));
        verify(feriasRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve bloquear solicitação quando saldo disponível for insuficiente")
    void deveBloquearSaldoInsuficiente() {
        FeriasRequest request = new FeriasRequest();
        request.setFuncionarioId(funcionarioId);
        request.setInicioGozo(LocalDate.of(2026, 12, 1));
        request.setFimGozo(LocalDate.of(2026, 12, 20));

        when(funcionarioRepository.findById(funcionarioId)).thenReturn(Optional.of(funcionario));
        when(feriasRepository.sumDiasUtilizadosNoPeriodo(eq(funcionarioId), any(), any(), anyList())).thenReturn(15);

        BusinessException ex = assertThrows(BusinessException.class, () -> feriasService.solicitar(request));
        assertTrue(ex.getMessage().contains("Saldo insuficiente"));
        verify(feriasRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve bloquear solicitação quando houver sobreposição de datas")
    void deveBloquearPeriodoSobreposto() {
        FeriasRequest request = new FeriasRequest();
        request.setFuncionarioId(funcionarioId);
        request.setInicioGozo(LocalDate.of(2026, 12, 1));
        request.setFimGozo(LocalDate.of(2026, 12, 10));

        when(funcionarioRepository.findById(funcionarioId)).thenReturn(Optional.of(funcionario));
        when(feriasRepository.sumDiasUtilizadosNoPeriodo(eq(funcionarioId), any(), any(), anyList())).thenReturn(0);
        when(feriasRepository.existsPeriodoSobreposto(eq(funcionarioId), any(), any(), anyList())).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> feriasService.solicitar(request));
        assertTrue(ex.getMessage().contains("Já existe uma solicitação"));
        verify(feriasRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve aprovar e permitir reverter solicitação antes do início do gozo")
    void deveAprovarEReverterSolicitacao() {
        UUID feriasId = UUID.randomUUID();
        Ferias ferias = new Ferias();
        ReflectionTestUtils.setField(ferias, "id", feriasId);
        ferias.setFuncionario(funcionario);
        ferias.setInicioPeriodoAquisitivo(LocalDate.of(2025, 5, 5));
        ferias.setFimPeriodoAquisitivo(LocalDate.of(2026, 5, 4));
        ferias.setInicioGozo(LocalDate.of(2026, 12, 1));
        ferias.setFimGozo(LocalDate.of(2026, 12, 15));
        ferias.setQuantidadeDias(15);
        ferias.setStatus(StatusFerias.SOLICITADA);

        when(feriasRepository.findById(feriasId)).thenReturn(Optional.of(ferias));
        when(feriasRepository.save(any(Ferias.class))).thenAnswer(inv -> inv.getArgument(0));

        FeriasResponse aprovada = feriasService.aprovar(feriasId);
        assertEquals(StatusFerias.APROVADA, aprovada.getStatus());

        FeriasResponse revertida = feriasService.reverter(feriasId);
        assertEquals(StatusFerias.SOLICITADA, revertida.getStatus());
    }

    @Test
    @DisplayName("Não deve permitir cancelar férias que já estão EM_GOZO")
    void naoDeveCancelarFeriasEmGozo() {
        UUID feriasId = UUID.randomUUID();
        Ferias ferias = new Ferias();
        ReflectionTestUtils.setField(ferias, "id", feriasId);
        ferias.setFuncionario(funcionario);
        ferias.setStatus(StatusFerias.EM_GOZO);

        when(feriasRepository.findById(feriasId)).thenReturn(Optional.of(ferias));

        BusinessException ex = assertThrows(BusinessException.class, () -> feriasService.cancelar(feriasId));
        assertEquals("Somente férias aprovadas podem ser canceladas.", ex.getMessage());
    }
}