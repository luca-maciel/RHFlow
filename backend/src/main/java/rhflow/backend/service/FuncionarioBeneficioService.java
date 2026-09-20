package rhflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.EncerramentoBeneficioRequest;
import rhflow.backend.dto.FuncionarioBeneficioRequest;
import rhflow.backend.dto.FuncionarioBeneficioResponse;
import rhflow.backend.entity.postgresql.Beneficio;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.entity.postgresql.FuncionarioBeneficio;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.BeneficioRepository;
import rhflow.backend.repository.postgresql.FuncionarioBeneficioRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FuncionarioBeneficioService {

    private final FuncionarioBeneficioRepository repository;
    private final FuncionarioRepository funcionarioRepository;
    private final BeneficioRepository beneficioRepository;

    public FuncionarioBeneficioService(
            FuncionarioBeneficioRepository repository,
            FuncionarioRepository funcionarioRepository,
            BeneficioRepository beneficioRepository
    ) {
        this.repository = repository;
        this.funcionarioRepository = funcionarioRepository;
        this.beneficioRepository = beneficioRepository;
    }

    public FuncionarioBeneficioResponse atribuir(
            FuncionarioBeneficioRequest request
    ) {

        Funcionario funcionario = funcionarioRepository
                .findById(request.getFuncionarioId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Funcionário não encontrado."
                        )
                );

        Beneficio beneficio = beneficioRepository
                .findById(request.getBeneficioId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Benefício não encontrado."
                        )
                );

        if (!funcionario.isAtivo()) {
            throw new BusinessException(
                    "Não é possível atribuir benefício a funcionário inativo."
            );
        }

        if (!beneficio.isAtivo()) {
            throw new BusinessException(
                    "Não é possível atribuir um benefício desativado."
            );
        }

        boolean jaPossui =
                repository
                    .existsByFuncionarioIdAndBeneficioIdAndAtivoTrue(
                        funcionario.getId(),
                        beneficio.getId()
                    );

        if (jaPossui) {
            throw new BusinessException(
                    "O funcionário já possui este benefício ativo."
            );
        }

        FuncionarioBeneficio vinculo =
                new FuncionarioBeneficio();

        vinculo.setFuncionario(funcionario);
        vinculo.setBeneficio(beneficio);
        vinculo.setValor(request.getValor());
        vinculo.setDataAdesao(request.getDataAdesao());
        vinculo.setAtivo(true);

        vinculo = repository.save(vinculo);

        return toResponse(vinculo);
    }

    @Transactional(readOnly = true)
    public List<FuncionarioBeneficioResponse>
    listarPorFuncionario(UUID funcionarioId) {

        if (!funcionarioRepository.existsById(funcionarioId)) {
            throw new ResourceNotFoundException(
                    "Funcionário não encontrado."
            );
        }

        return repository
                .findByFuncionarioId(funcionarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FuncionarioBeneficioResponse>
    listarAtivosPorFuncionario(UUID funcionarioId) {

        if (!funcionarioRepository.existsById(funcionarioId)) {
            throw new ResourceNotFoundException(
                    "Funcionário não encontrado."
            );
        }

        return repository
                .findByFuncionarioIdAndAtivoTrue(funcionarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FuncionarioBeneficioResponse encerrar(
            UUID id,
            EncerramentoBeneficioRequest request
    ) {

        FuncionarioBeneficio vinculo =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                    "Benefício do funcionário não encontrado."
                                )
                        );

        if (!vinculo.isAtivo()) {
            throw new BusinessException(
                    "Este benefício já está encerrado."
            );
        }

        if (request.getDataEncerramento()
                .isBefore(vinculo.getDataAdesao())) {

            throw new BusinessException(
                    "A data de encerramento não pode ser anterior à data de adesão."
            );
        }

        vinculo.setDataEncerramento(
                request.getDataEncerramento()
        );

        vinculo.setAtivo(false);

        return toResponse(repository.save(vinculo));
    }

    private FuncionarioBeneficioResponse toResponse(
            FuncionarioBeneficio vinculo
    ) {

        return new FuncionarioBeneficioResponse(
                vinculo.getId(),
                vinculo.getFuncionario().getId(),
                vinculo.getFuncionario().getNome(),
                vinculo.getBeneficio().getId(),
                vinculo.getBeneficio().getNome(),
                vinculo.getValor(),
                vinculo.getDataAdesao(),
                vinculo.getDataEncerramento(),
                vinculo.isAtivo(),
                vinculo.getCreatedAt(),
                vinculo.getUpdatedAt()
        );
    }
}