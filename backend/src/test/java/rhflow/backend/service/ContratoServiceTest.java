package rhflow.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import rhflow.backend.dto.ContratoRequest;
import rhflow.backend.dto.ContratoResponse;
import rhflow.backend.dto.EncerramentoContratoRequest;
import rhflow.backend.entity.postgresql.Contrato;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.enums.StatusContrato;
import rhflow.backend.enums.StatusFuncionario;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.repository.postgresql.ContratoRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContratoServiceTest {

    @Mock
    private ContratoRepository contratoRepository;

    @Mock
    private FuncionarioRepository funcionarioRepository;

    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private ContratoService contratoService;

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
    }

    @Test
    @DisplayName("Deve criar contrato ativo para funcionário válido")
    void deveCriarContratoComSucesso() {
        ContratoRequest request = new ContratoRequest();
        request.setFuncionarioId(funcionarioId);
        request.setTipo("CLT");
        request.setDataInicio(LocalDate.of(2026, 2, 1));
        request.setDescricao("Contrato efetivo");

        when(funcionarioRepository.findById(funcionarioId)).thenReturn(Optional.of(funcionario));
        when(contratoRepository.existsByFuncionarioIdAndStatus(funcionarioId, StatusContrato.ATIVO)).thenReturn(false);
        when(contratoRepository.save(any(Contrato.class))).thenAnswer(inv -> {
            Contrato c = inv.getArgument(0);
            ReflectionTestUtils.setField(c, "id", UUID.randomUUID());
            return c;
        });

        ContratoResponse response = contratoService.criar(request);

        assertNotNull(response);
        assertEquals("CLT", response.getTipo());
        assertEquals(StatusContrato.ATIVO, response.getStatus());
        verify(auditoriaService, times(1))
                .registrar(eq("CRIAR_CONTRATO"), eq("CONTRATO"), any(), any(), anyMap());
    }

    @Test
    @DisplayName("Deve bloquear criação de segundo contrato quando já existir um ativo")
    void deveBloquearContratoAtivoDuplicado() {
        ContratoRequest request = new ContratoRequest();
        request.setFuncionarioId(funcionarioId);
        request.setTipo("PJ");
        request.setDataInicio(LocalDate.of(2026, 3, 1));

        when(funcionarioRepository.findById(funcionarioId)).thenReturn(Optional.of(funcionario));
        when(contratoRepository.existsByFuncionarioIdAndStatus(funcionarioId, StatusContrato.ATIVO)).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> contratoService.criar(request));
        assertEquals("O funcionário já possui um contrato ativo.", ex.getMessage());
        verify(contratoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve bloquear encerramento com data anterior ao início do contrato")
    void deveBloquearDataEncerramentoAnteriorAoInicio() {
        UUID contratoId = UUID.randomUUID();
        Contrato contrato = new Contrato();
        ReflectionTestUtils.setField(contrato, "id", contratoId);
        contrato.setFuncionario(funcionario);
        contrato.setTipo("CLT");
        contrato.setDataInicio(LocalDate.of(2026, 5, 10));
        contrato.setStatus(StatusContrato.ATIVO);

        EncerramentoContratoRequest request = new EncerramentoContratoRequest();
        request.setDataFim(LocalDate.of(2026, 5, 1));

        when(contratoRepository.findById(contratoId)).thenReturn(Optional.of(contrato));

        BusinessException ex = assertThrows(BusinessException.class, () -> contratoService.encerrar(contratoId, request));
        assertEquals("A data de encerramento não pode ser anterior à data de início.", ex.getMessage());
        verify(contratoRepository, never()).save(any());
    }
}