package rhflow.backend.service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.PermissaoRequest;
import rhflow.backend.dto.PermissaoResponse;
import rhflow.backend.entity.postgresql.Permissao;
import rhflow.backend.repository.postgresql.PermissaoRepository;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;

@Service
@Transactional
public class PermissaoService {

    private final PermissaoRepository repository;

    public PermissaoService(PermissaoRepository repository) {
        this.repository = repository;
    }

    public PermissaoResponse cadastrar(PermissaoRequest request) {
        String codigo = normalizar(request.codigo());

        if (repository.existsByCodigo(codigo)) {
            throw new BusinessException(
                "Já existe uma permissão com este código"
            );
        }

        Permissao permissao = new Permissao();
        permissao.setCodigo(codigo);
        permissao.setDescricao(request.descricao());

        return toResponse(repository.save(permissao));
    }

    @Transactional(readOnly = true)
    public List<PermissaoResponse> listar() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PermissaoResponse buscarPorId(UUID id) {
        return toResponse(buscar(id));
    }

    public PermissaoResponse atualizar(
            UUID id,
            PermissaoRequest request
    ) {
        Permissao permissao = buscar(id);
        String codigo = normalizar(request.codigo());

        if (!permissao.getCodigo().equals(codigo)
                && repository.existsByCodigo(codigo)) {
            throw new BusinessException(
                "Já existe uma permissão com este código"
            );
        }

        permissao.setCodigo(codigo);
        permissao.setDescricao(request.descricao());

        return toResponse(permissao);
    }

    private Permissao buscar(UUID id) {
        return repository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Permissão não encontrada"
                    )
                );
    }

    private String normalizar(String codigo) {
        return codigo.trim().toUpperCase(Locale.ROOT);
    }

    private PermissaoResponse toResponse(Permissao permissao) {
        return new PermissaoResponse(
            permissao.getId(),
            permissao.getCodigo(),
            permissao.getDescricao()
        );
    }
}