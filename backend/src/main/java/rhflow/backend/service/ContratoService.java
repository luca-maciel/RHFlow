package rhflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rhflow.backend.dto.ContratoRequest;
import rhflow.backend.dto.ContratoResponse;
import rhflow.backend.dto.EncerramentoContratoRequest;
import rhflow.backend.entity.postgresql.Contrato;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.enums.StatusContrato;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.ContratoRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class ContratoService {

    private final ContratoRepository contratoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final AuditoriaService auditoriaService;

    public ContratoService(
            ContratoRepository contratoRepository,
            FuncionarioRepository funcionarioRepository,
            AuditoriaService auditoriaService) {
        this.contratoRepository = contratoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.auditoriaService = auditoriaService;
    }

    public ContratoResponse criar(ContratoRequest request) {
        Funcionario funcionario = buscarFuncionario(request.getFuncionarioId());

        if (!funcionario.isAtivo()) {
            throw new BusinessException("Não é possível criar contrato para funcionário inativo.");
        }

        boolean possuiContratoAtivo = contratoRepository.existsByFuncionarioIdAndStatus(
                funcionario.getId(), StatusContrato.ATIVO);

        if (possuiContratoAtivo) {
            throw new BusinessException("O funcionário já possui um contrato ativo.");
        }

        Contrato contrato = new Contrato();
        contrato.setFuncionario(funcionario);
        contrato.setTipo(request.getTipo());
        contrato.setDataInicio(request.getDataInicio());
        contrato.setDescricao(request.getDescricao());
        contrato.setStatus(StatusContrato.ATIVO);

        Contrato salvo = contratoRepository.save(contrato);

        auditoriaService.registrar(
                "CRIAR_CONTRATO",
                "CONTRATO",
                salvo.getId().toString(),
                "Contrato " + salvo.getTipo() + " criado para " + funcionario.getNome(),
                Map.of(
                        "funcionarioId", funcionario.getId().toString(),
                        "tipo", salvo.getTipo(),
                        "dataInicio", salvo.getDataInicio().toString()
                )
        );

        return toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<ContratoResponse> listarTodos() {
        return contratoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ContratoResponse buscarPorId(UUID id) {
        return toResponse(buscarContrato(id));
    }

    @Transactional(readOnly = true)
    public List<ContratoResponse> listarPorFuncionario(UUID funcionarioId) {
        buscarFuncionario(funcionarioId);
        return contratoRepository.findByFuncionarioId(funcionarioId).stream().map(this::toResponse).toList();
    }

    public ContratoResponse encerrar(UUID id, EncerramentoContratoRequest request) {
        Contrato contrato = buscarContrato(id);

        if (contrato.getStatus() == StatusContrato.ENCERRADO) {
            throw new BusinessException("O contrato já está encerrado.");
        }

        if (request.getDataFim().isBefore(contrato.getDataInicio())) {
            throw new BusinessException("A data de encerramento não pode ser anterior à data de início.");
        }

        contrato.setDataFim(request.getDataFim());
        contrato.setStatus(StatusContrato.ENCERRADO);

        Contrato salvo = contratoRepository.save(contrato);

        auditoriaService.registrar(
                "ENCERRAR_CONTRATO",
                "CONTRATO",
                salvo.getId().toString(),
                "Contrato encerrado para " + salvo.getFuncionario().getNome() + " em " + salvo.getDataFim(),
                Map.of("dataFim", salvo.getDataFim().toString())
        );

        return toResponse(salvo);
    }

    public void encerrarContratoAtivoDoFuncionario(UUID funcionarioId, LocalDate dataEncerramento) {
        List<Contrato> contratos = contratoRepository.findByFuncionarioId(funcionarioId);
        for (Contrato contrato : contratos) {
            if (contrato.getStatus() == StatusContrato.ATIVO) {
                LocalDate dataFim = dataEncerramento.isBefore(contrato.getDataInicio())
                        ? contrato.getDataInicio()
                        : dataEncerramento;
                contrato.setDataFim(dataFim);
                contrato.setStatus(StatusContrato.ENCERRADO);
                contratoRepository.save(contrato);

                auditoriaService.registrar(
                        "ENCERRAR_CONTRATO_AUTO",
                        "CONTRATO",
                        contrato.getId().toString(),
                        "Contrato encerrado automaticamente no desligamento de " + contrato.getFuncionario().getNome(),
                        Map.of("dataFim", dataFim.toString())
                );
            }
        }
    }

    private Funcionario buscarFuncionario(UUID id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado."));
    }

    private Contrato buscarContrato(UUID id) {
        return contratoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contrato não encontrado."));
    }

    private ContratoResponse toResponse(Contrato contrato) {
        Funcionario funcionario = contrato.getFuncionario();
        return new ContratoResponse(
                contrato.getId(),
                funcionario.getId(),
                funcionario.getNome(),
                contrato.getTipo(),
                contrato.getDataInicio(),
                contrato.getDataFim(),
                contrato.getStatus(),
                contrato.getDescricao(),
                contrato.getCreatedAt(),
                contrato.getUpdatedAt()
        );
    }
}