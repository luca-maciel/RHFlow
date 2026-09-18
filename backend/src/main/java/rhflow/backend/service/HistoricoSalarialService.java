package rhflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.HistoricoSalarialRequest;
import rhflow.backend.dto.HistoricoSalarialResponse;
import rhflow.backend.entity.postgresql.Contrato;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.entity.postgresql.HistoricoSalarial;
import rhflow.backend.enums.StatusContrato;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.ContratoRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;
import rhflow.backend.repository.postgresql.HistoricoSalarialRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class HistoricoSalarialService {

    private final HistoricoSalarialRepository historicoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ContratoRepository contratoRepository;

    public HistoricoSalarialService(
            HistoricoSalarialRepository historicoRepository,
            FuncionarioRepository funcionarioRepository,
            ContratoRepository contratoRepository
    ) {
        this.historicoRepository = historicoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.contratoRepository = contratoRepository;
    }

    public HistoricoSalarialResponse criar(
            HistoricoSalarialRequest request
    ) {

        Funcionario funcionario = funcionarioRepository
                .findById(request.getFuncionarioId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Funcionário não encontrado."
                        )
                );

        Contrato contrato = contratoRepository
                .findById(request.getContratoId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Contrato não encontrado."
                        )
                );

        if (!contrato.getFuncionario()
                .getId()
                .equals(funcionario.getId())) {

            throw new BusinessException(
                    "O contrato informado não pertence ao funcionário."
            );
        }

        if (contrato.getStatus() != StatusContrato.ATIVO) {
            throw new BusinessException(
                    "Não é possível registrar salário em contrato não ativo."
            );
        }

        var salarioAtual =
                historicoRepository
                        .findFirstByFuncionarioIdAndDataFimVigenciaIsNullOrderByDataInicioVigenciaDesc(
                                funcionario.getId()
                        );

        if (salarioAtual.isPresent()) {

            HistoricoSalarial atual =
                    salarioAtual.get();

            if (!request.getDataInicioVigencia()
                    .isAfter(atual.getDataInicioVigencia())) {

                throw new BusinessException(
                        "A nova vigência deve ser posterior à vigência salarial atual."
                );
            }

            LocalDate dataFim =
                    request.getDataInicioVigencia()
                            .minusDays(1);

            atual.setDataFimVigencia(dataFim);

            historicoRepository.save(atual);
        }

        HistoricoSalarial novo =
                new HistoricoSalarial();

        novo.setFuncionario(funcionario);
        novo.setContrato(contrato);
        novo.setValor(request.getValor());
        novo.setDataInicioVigencia(
                request.getDataInicioVigencia()
        );
        novo.setMotivo(request.getMotivo());

        novo = historicoRepository.save(novo);

        return toResponse(novo);
    }

    @Transactional(readOnly = true)
    public List<HistoricoSalarialResponse>
    listarPorFuncionario(UUID funcionarioId) {

        if (!funcionarioRepository.existsById(funcionarioId)) {
            throw new ResourceNotFoundException(
                    "Funcionário não encontrado."
            );
        }

        return historicoRepository
                .findByFuncionarioIdOrderByDataInicioVigenciaDesc(
                        funcionarioId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HistoricoSalarialResponse>
    listarPorContrato(UUID contratoId) {

        if (!contratoRepository.existsById(contratoId)) {
            throw new ResourceNotFoundException(
                    "Contrato não encontrado."
            );
        }

        return historicoRepository
                .findByContratoIdOrderByDataInicioVigenciaDesc(
                        contratoId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public HistoricoSalarialResponse
    buscarSalarioAtual(UUID funcionarioId) {

        HistoricoSalarial salario =
                historicoRepository
                        .findFirstByFuncionarioIdAndDataFimVigenciaIsNullOrderByDataInicioVigenciaDesc(
                                funcionarioId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Funcionário não possui salário vigente."
                                )
                        );

        return toResponse(salario);
    }

    private HistoricoSalarialResponse toResponse(
            HistoricoSalarial historico
    ) {

        return new HistoricoSalarialResponse(
                historico.getId(),
                historico.getFuncionario().getId(),
                historico.getFuncionario().getNome(),
                historico.getContrato().getId(),
                historico.getValor(),
                historico.getDataInicioVigencia(),
                historico.getDataFimVigencia(),
                historico.getMotivo(),
                historico.getCreatedAt()
        );
    }
}