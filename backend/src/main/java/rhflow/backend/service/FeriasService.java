package rhflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.FeriasRequest;
import rhflow.backend.dto.FeriasResponse;
import rhflow.backend.entity.postgresql.Ferias;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.enums.StatusFerias;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.FeriasRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FeriasService {

    private final FeriasRepository feriasRepository;
    private final FuncionarioRepository funcionarioRepository;

    public FeriasService(
            FeriasRepository feriasRepository,
            FuncionarioRepository funcionarioRepository
    ) {
        this.feriasRepository = feriasRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    public FeriasResponse solicitar(FeriasRequest request) {

        Funcionario funcionario = funcionarioRepository
                .findById(request.getFuncionarioId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Funcionário não encontrado."
                        )
                );

        if (!funcionario.isAtivo()) {
            throw new BusinessException(
                    "Não é possível solicitar férias para funcionário inativo."
            );
        }

        if (request.getFimPeriodoAquisitivo()
                .isBefore(request.getInicioPeriodoAquisitivo())) {

            throw new BusinessException(
                    "O fim do período aquisitivo não pode ser anterior ao início."
            );
        }

        if (request.getFimGozo()
                .isBefore(request.getInicioGozo())) {

            throw new BusinessException(
                    "O fim das férias não pode ser anterior ao início."
            );
        }

        long quantidadeDias = ChronoUnit.DAYS.between(
                request.getInicioGozo(),
                request.getFimGozo()
        ) + 1;

        if (quantidadeDias > 30) {
            throw new BusinessException(
                    "O período de férias não pode ultrapassar 30 dias."
            );
        }

        Ferias ferias = new Ferias();

        ferias.setFuncionario(funcionario);

        ferias.setInicioPeriodoAquisitivo(
                request.getInicioPeriodoAquisitivo()
        );

        ferias.setFimPeriodoAquisitivo(
                request.getFimPeriodoAquisitivo()
        );

        ferias.setInicioGozo(
                request.getInicioGozo()
        );

        ferias.setFimGozo(
                request.getFimGozo()
        );

        ferias.setQuantidadeDias(
                Math.toIntExact(quantidadeDias)
        );

        ferias.setStatus(
                StatusFerias.SOLICITADA
        );

        ferias.setObservacao(
                request.getObservacao()
        );

        ferias = feriasRepository.save(ferias);

        return toResponse(ferias);
    }

    @Transactional(readOnly = true)
    public List<FeriasResponse> listarTodos() {

        return feriasRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FeriasResponse buscarPorId(UUID id) {
        return toResponse(buscarFerias(id));
    }

    @Transactional(readOnly = true)
    public List<FeriasResponse> listarPorFuncionario(
            UUID funcionarioId
    ) {

        if (!funcionarioRepository.existsById(funcionarioId)) {
            throw new ResourceNotFoundException(
                    "Funcionário não encontrado."
            );
        }

        return feriasRepository
                .findByFuncionarioIdOrderByInicioGozoDesc(
                        funcionarioId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FeriasResponse aprovar(UUID id) {

        Ferias ferias = buscarFerias(id);

        validarStatus(
                ferias,
                StatusFerias.SOLICITADA,
                "Somente férias solicitadas podem ser aprovadas."
        );

        ferias.setStatus(StatusFerias.APROVADA);

        return toResponse(
                feriasRepository.save(ferias)
        );
    }

    public FeriasResponse rejeitar(UUID id) {

        Ferias ferias = buscarFerias(id);

        validarStatus(
                ferias,
                StatusFerias.SOLICITADA,
                "Somente férias solicitadas podem ser rejeitadas."
        );

        ferias.setStatus(StatusFerias.REJEITADA);

        return toResponse(
                feriasRepository.save(ferias)
        );
    }

    public FeriasResponse iniciar(UUID id) {

        Ferias ferias = buscarFerias(id);

        validarStatus(
                ferias,
                StatusFerias.APROVADA,
                "Somente férias aprovadas podem ser iniciadas."
        );

        ferias.setStatus(StatusFerias.EM_GOZO);

        return toResponse(
                feriasRepository.save(ferias)
        );
    }

    public FeriasResponse concluir(UUID id) {

        Ferias ferias = buscarFerias(id);

        validarStatus(
                ferias,
                StatusFerias.EM_GOZO,
                "Somente férias em gozo podem ser concluídas."
        );

        ferias.setStatus(StatusFerias.CONCLUIDA);

        return toResponse(
                feriasRepository.save(ferias)
        );
    }

    public FeriasResponse cancelar(UUID id) {

        Ferias ferias = buscarFerias(id);

        validarStatus(
                ferias,
                StatusFerias.APROVADA,
                "Somente férias aprovadas podem ser canceladas."
        );

        ferias.setStatus(StatusFerias.CANCELADA);

        return toResponse(
                feriasRepository.save(ferias)
        );
    }

    private Ferias buscarFerias(UUID id) {

        return feriasRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Registro de férias não encontrado."
                        )
                );
    }

    private void validarStatus(
            Ferias ferias,
            StatusFerias statusEsperado,
            String mensagem
    ) {

        if (ferias.getStatus() != statusEsperado) {
            throw new BusinessException(mensagem);
        }
    }

    private FeriasResponse toResponse(Ferias ferias) {

        return new FeriasResponse(
                ferias.getId(),
                ferias.getFuncionario().getId(),
                ferias.getFuncionario().getNome(),
                ferias.getInicioPeriodoAquisitivo(),
                ferias.getFimPeriodoAquisitivo(),
                ferias.getInicioGozo(),
                ferias.getFimGozo(),
                ferias.getQuantidadeDias(),
                ferias.getStatus(),
                ferias.getObservacao(),
                ferias.getCreatedAt(),
                ferias.getUpdatedAt()
        );
    }
}