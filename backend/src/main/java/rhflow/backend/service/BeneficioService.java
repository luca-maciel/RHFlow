package rhflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.BeneficioRequest;
import rhflow.backend.dto.BeneficioResponse;
import rhflow.backend.entity.postgresql.Beneficio;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.BeneficioRepository;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BeneficioService {

    private final BeneficioRepository beneficioRepository;

    public BeneficioService(
            BeneficioRepository beneficioRepository
    ) {
        this.beneficioRepository = beneficioRepository;
    }

    public BeneficioResponse criar(
            BeneficioRequest request
    ) {

        if (beneficioRepository
                .existsByNomeIgnoreCase(request.getNome())) {

            throw new BusinessException(
                    "Já existe um benefício com este nome."
            );
        }

        Beneficio beneficio = new Beneficio();

        beneficio.setNome(request.getNome());
        beneficio.setDescricao(request.getDescricao());
        beneficio.setAtivo(true);

        beneficio = beneficioRepository.save(beneficio);

        return toResponse(beneficio);
    }

    @Transactional(readOnly = true)
    public List<BeneficioResponse> listarTodos() {

        return beneficioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BeneficioResponse> listarAtivos() {

        return beneficioRepository.findByAtivoTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BeneficioResponse buscarPorId(UUID id) {
        return toResponse(buscarBeneficio(id));
    }

    public BeneficioResponse atualizar(
            UUID id,
            BeneficioRequest request
    ) {

        Beneficio beneficio = buscarBeneficio(id);

        if (!beneficio.getNome()
                .equalsIgnoreCase(request.getNome())
                && beneficioRepository
                    .existsByNomeIgnoreCase(request.getNome())) {

            throw new BusinessException(
                    "Já existe um benefício com este nome."
            );
        }

        beneficio.setNome(request.getNome());
        beneficio.setDescricao(request.getDescricao());

        return toResponse(
                beneficioRepository.save(beneficio)
        );
    }

    public BeneficioResponse desativar(UUID id) {

        Beneficio beneficio = buscarBeneficio(id);

        if (!beneficio.isAtivo()) {
            throw new BusinessException(
                    "O benefício já está desativado."
            );
        }

        beneficio.setAtivo(false);

        return toResponse(
                beneficioRepository.save(beneficio)
        );
    }

    private Beneficio buscarBeneficio(UUID id) {

        return beneficioRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Benefício não encontrado."
                        )
                );
    }

    private BeneficioResponse toResponse(
            Beneficio beneficio
    ) {

        return new BeneficioResponse(
                beneficio.getId(),
                beneficio.getNome(),
                beneficio.getDescricao(),
                beneficio.isAtivo(),
                beneficio.getCreatedAt(),
                beneficio.getUpdatedAt()
        );
    }
}