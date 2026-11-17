package rhflow.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import rhflow.backend.dto.DesligamentoFuncionarioRequest;
import rhflow.backend.dto.FuncionarioRequest;
import rhflow.backend.dto.FuncionarioResponse;
import rhflow.backend.entity.postgresql.Cargo;
import rhflow.backend.entity.postgresql.Departamento;
import rhflow.backend.entity.postgresql.Empresa;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.enums.StatusFuncionario;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.repository.postgresql.CargoRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FuncionarioServiceTest {

    @Mock
    private FuncionarioRepository funcionarioRepository;

    @Mock
    private CargoRepository cargoRepository;

    @Mock
    private ContratoService contratoService;

    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private FuncionarioService funcionarioService;

    private Empresa empresa;
    private Departamento departamento;
    private Cargo cargo;
    private UUID cargoId;

    @BeforeEach
    void setUp() {
        empresa = new Empresa();
        ReflectionTestUtils.setField(empresa, "id", UUID.randomUUID());
        empresa.setNome("RHFlow Tecnologia");
        empresa.setAtivo(true);

        departamento = new Departamento();
        ReflectionTestUtils.setField(departamento, "id", UUID.randomUUID());
        departamento.setNome("Engenharia de Software");
        departamento.setEmpresa(empresa);
        departamento.setAtivo(true);

        cargoId = UUID.randomUUID();
        cargo = new Cargo();
        ReflectionTestUtils.setField(cargo, "id", cargoId);
        cargo.setNome("Desenvolvedor Backend");
        cargo.setDepartamento(departamento);
        cargo.setAtivo(true);
    }

    @Test
    @DisplayName("Deve admitir funcionário válido e registrar auditoria")
    void deveCriarFuncionarioComSucesso() {
        FuncionarioRequest request = new FuncionarioRequest();
        request.setCargoId(cargoId);
        request.setNome("Lucas Ferreira");
        request.setCpf("12345678901");
        request.setEmail("lucas@rhflow.com");
        request.setDataAdmissao(LocalDate.of(2026, 1, 10));

        when(cargoRepository.findById(cargoId)).thenReturn(Optional.of(cargo));
        when(funcionarioRepository.existsByCpf("12345678901")).thenReturn(false);
        when(funcionarioRepository.save(any(Funcionario.class))).thenAnswer(inv -> {
            Funcionario f = inv.getArgument(0);
            ReflectionTestUtils.setField(f, "id", UUID.randomUUID());
            return f;
        });

        FuncionarioResponse response = funcionarioService.criar(request);

        assertNotNull(response);
        assertEquals("Lucas Ferreira", response.getNome());
        assertEquals(StatusFuncionario.ATIVO, response.getStatus());
        assertTrue(response.isAtivo());
        verify(auditoriaService, times(1))
                .registrar(eq("CADASTRAR_FUNCIONARIO"), eq("FUNCIONARIO"), any(), any(), anyMap());
    }

    @Test
    @DisplayName("Deve bloquear cadastro quando CPF já existir no sistema")
    void deveBloquearCpfDuplicado() {
        FuncionarioRequest request = new FuncionarioRequest();
        request.setCargoId(cargoId);
        request.setNome("Colaborador Duplicado");
        request.setCpf("12345678901");
        request.setDataAdmissao(LocalDate.of(2026, 1, 10));

        when(cargoRepository.findById(cargoId)).thenReturn(Optional.of(cargo));
        when(funcionarioRepository.existsByCpf("12345678901")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> funcionarioService.criar(request));
        assertEquals("Já existe um funcionário cadastrado com esse CPF.", ex.getMessage());
        verify(funcionarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve bloquear vínculo com cargo inativo")
    void deveBloquearCargoInativo() {
        cargo.setAtivo(false);

        FuncionarioRequest request = new FuncionarioRequest();
        request.setCargoId(cargoId);
        request.setNome("Lucas Ferreira");
        request.setCpf("12345678901");
        request.setDataAdmissao(LocalDate.of(2026, 1, 10));

        when(cargoRepository.findById(cargoId)).thenReturn(Optional.of(cargo));

        BusinessException ex = assertThrows(BusinessException.class, () -> funcionarioService.criar(request));
        assertEquals("Não é possível vincular o funcionário a um cargo inativo.", ex.getMessage());
        verify(funcionarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve desligar funcionário e encerrar contrato ativo automaticamente")
    void deveDesligarFuncionarioEEncerrarContratoAtivo() {
        UUID funcId = UUID.randomUUID();
        Funcionario funcionario = new Funcionario();
        ReflectionTestUtils.setField(funcionario, "id", funcId);
        funcionario.setCargo(cargo);
        funcionario.setNome("Lucas Ferreira");
        funcionario.setDataAdmissao(LocalDate.of(2025, 5, 5));
        funcionario.setStatus(StatusFuncionario.ATIVO);
        funcionario.setAtivo(true);

        DesligamentoFuncionarioRequest request = new DesligamentoFuncionarioRequest();
        LocalDate dataDemissao = LocalDate.of(2026, 11, 17);
        request.setDataDemissao(dataDemissao);

        when(funcionarioRepository.findById(funcId)).thenReturn(Optional.of(funcionario));
        when(funcionarioRepository.save(any(Funcionario.class))).thenAnswer(inv -> inv.getArgument(0));

        FuncionarioResponse response = funcionarioService.desligar(funcId, request);

        assertEquals(StatusFuncionario.DESLIGADO, response.getStatus());
        assertFalse(response.isAtivo());
        assertEquals(dataDemissao, response.getDataDemissao());
        verify(contratoService, times(1)).encerrarContratoAtivoDoFuncionario(funcId, dataDemissao);
        verify(auditoriaService, times(1))
                .registrar(eq("DESLIGAR_FUNCIONARIO"), eq("FUNCIONARIO"), eq(funcId.toString()), any(), anyMap());
    }
}