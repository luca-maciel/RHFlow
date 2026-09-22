package rhflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.AvaliacaoDesempenhoRequest;
import rhflow.backend.dto.AvaliacaoDesempenhoResponse;
import rhflow.backend.entity.postgresql.AvaliacaoDesempenho;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.enums.StatusAvaliacao;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.AvaliacaoDesempenhoRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AvaliacaoDesempenhoService {

    private final AvaliacaoDesempenhoRepository avaliacaoRepository;
    private final FuncionarioRepository funcionarioRepository;

    public AvaliacaoDesempenhoService(
            AvaliacaoDesempenhoRepository avaliacaoRepository,
            FuncionarioRepository funcionarioRepository
    ) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    public AvaliacaoDesempenhoResponse criar(
            AvaliacaoDesempenhoRequest request
    ) {

        Funcionario funcionario =
                buscarFuncionario(request.getFuncionarioId());

        if (!funcionario.isAtivo()) {
            throw new BusinessException(
                    "Não é possível avaliar um funcionário inativo."
            );
        }

        validarPeriodo(request);

        AvaliacaoDesempenho avaliacao =
                new AvaliacaoDesempenho();

        avaliacao.setFuncionario(funcionario);
        preencherDados(avaliacao, request);
        avaliacao.setStatus(StatusAvaliacao.RASCUNHO);

        return toResponse(
                avaliacaoRepository.save(avaliacao)
        );
    }

    public AvaliacaoDesempenhoResponse atualizar(
            UUID id,
            AvaliacaoDesempenhoRequest request
    ) {

        AvaliacaoDesempenho avaliacao =
                buscarAvaliacao(id);

        if (avaliacao.getStatus()
                != StatusAvaliacao.RASCUNHO) {

            throw new BusinessException(
                    "Somente avaliações em rascunho podem ser alteradas."
            );
        }

        Funcionario funcionario =
                buscarFuncionario(request.getFuncionarioId());

        if (!funcionario.isAtivo()) {
            throw new BusinessException(
                    "Não é possível avaliar um funcionário inativo."
            );
        }

        validarPeriodo(request);

        avaliacao.setFuncionario(funcionario);

        preencherDados(avaliacao, request);

        return toResponse(
                avaliacaoRepository.save(avaliacao)
        );
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoDesempenhoResponse> listarTodos() {

        return avaliacaoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AvaliacaoDesempenhoResponse buscarPorId(
            UUID id
    ) {

        return toResponse(
                buscarAvaliacao(id)
        );
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoDesempenhoResponse>
    listarPorFuncionario(UUID funcionarioId) {

        if (!funcionarioRepository.existsById(funcionarioId)) {
            throw new ResourceNotFoundException(
                    "Funcionário não encontrado."
            );
        }

        return avaliacaoRepository
                .findByFuncionarioIdOrderByFimPeriodoDesc(
                        funcionarioId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AvaliacaoDesempenhoResponse finalizar(
            UUID id
    ) {

        AvaliacaoDesempenho avaliacao =
                buscarAvaliacao(id);

        if (avaliacao.getStatus()
                != StatusAvaliacao.RASCUNHO) {

            throw new BusinessException(
                    "Somente avaliações em rascunho podem ser finalizadas."
            );
        }

        avaliacao.setStatus(
                StatusAvaliacao.FINALIZADA
        );

        return toResponse(
                avaliacaoRepository.save(avaliacao)
        );
    }

    public AvaliacaoDesempenhoResponse cancelar(
            UUID id
    ) {

        AvaliacaoDesempenho avaliacao =
                buscarAvaliacao(id);

        if (avaliacao.getStatus()
                != StatusAvaliacao.RASCUNHO) {

            throw new BusinessException(
                    "Somente avaliações em rascunho podem ser canceladas."
            );
        }

        avaliacao.setStatus(
                StatusAvaliacao.CANCELADA
        );

        return toResponse(
                avaliacaoRepository.save(avaliacao)
        );
    }

    private Funcionario buscarFuncionario(
            UUID id
    ) {

        return funcionarioRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Funcionário não encontrado."
                        )
                );
    }

    private AvaliacaoDesempenho buscarAvaliacao(
            UUID id
    ) {

        return avaliacaoRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Avaliação de desempenho não encontrada."
                        )
                );
    }

    private void validarPeriodo(
            AvaliacaoDesempenhoRequest request
    ) {

        if (request.getFimPeriodo()
                .isBefore(request.getInicioPeriodo())) {

            throw new BusinessException(
                    "O fim do período não pode ser anterior ao início."
            );
        }
    }

    private void preencherDados(
            AvaliacaoDesempenho avaliacao,
            AvaliacaoDesempenhoRequest request
    ) {

        avaliacao.setInicioPeriodo(
                request.getInicioPeriodo()
        );

        avaliacao.setFimPeriodo(
                request.getFimPeriodo()
        );

        avaliacao.setNota(
                request.getNota()
        );

        avaliacao.setPontosFortes(
                request.getPontosFortes()
        );

        avaliacao.setPontosMelhoria(
                request.getPontosMelhoria()
        );

        avaliacao.setObservacao(
                request.getObservacao()
        );
    }

    private AvaliacaoDesempenhoResponse toResponse(
            AvaliacaoDesempenho avaliacao
    ) {

        return new AvaliacaoDesempenhoResponse(
                avaliacao.getId(),
                avaliacao.getFuncionario().getId(),
                avaliacao.getFuncionario().getNome(),
                avaliacao.getInicioPeriodo(),
                avaliacao.getFimPeriodo(),
                avaliacao.getNota(),
                avaliacao.getPontosFortes(),
                avaliacao.getPontosMelhoria(),
                avaliacao.getObservacao(),
                avaliacao.getStatus(),
                avaliacao.getCreatedAt(),
                avaliacao.getUpdatedAt()
        );
    }
}