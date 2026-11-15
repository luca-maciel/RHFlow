package rhflow.backend.service;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.PermissaoRequest;
import rhflow.backend.dto.PermissaoResponse;
import rhflow.backend.entity.postgresql.Permissao;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.PermissaoRepository;

@Service
@Transactional
public class PermissaoService {

    private final PermissaoRepository repository;
    private final AuditoriaService auditoriaService;

    public PermissaoService(
            PermissaoRepository repository,
            AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    public PermissaoResponse cadastrar(PermissaoRequest request) {
        String codigo = normalizar(request.codigo());

        if (repository.existsByCodigo(codigo)) {
            throw new BusinessException("Já existe uma permissão com este código");
        }

        Permissao permissao = new Permissao();
        permissao.setCodigo(codigo);
        permissao.setDescricao(request.descricao());

        Permissao salva = repository.save(permissao);

        auditoriaService.registrar(
                "CADASTRAR_PERMISSAO",
                "PERMISSAO",
                salva.getId().toString(),
                "Permissão '" + salva.getCodigo() + "' cadastrada",
                Map.of("codigo", salva.getCodigo())
        );

        return toResponse(salva);
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

    public PermissaoResponse atualizar(UUID id, PermissaoRequest request) {
        Permissao permissao = buscar(id);
        String codigo = normalizar(request.codigo());

        if (!permissao.getCodigo().equals(codigo)
                && repository.existsByCodigo(codigo)) {
            throw new BusinessException("Já existe uma permissão com este código");
        }

        permissao.setCodigo(codigo);
        permissao.setDescricao(request.descricao());

        auditoriaService.registrar(
                "ATUALIZAR_PERMISSAO",
                "PERMISSAO",
                permissao.getId().toString(),
                "Permissão '" + permissao.getCodigo() + "' atualizada",
                Map.of("codigo", permissao.getCodigo())
        );

        return toResponse(permissao);
    }

    private Permissao buscar(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada"));
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