package rhflow.backend.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.PerfilRequest;
import rhflow.backend.dto.PerfilResponse;
import rhflow.backend.entity.postgresql.Perfil;
import rhflow.backend.entity.postgresql.Permissao;
import rhflow.backend.repository.postgresql.PerfilRepository;
import rhflow.backend.repository.postgresql.PermissaoRepository;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;

@Service
@Transactional
public class PerfilService {

    private final PerfilRepository perfilRepository;
    private final PermissaoRepository permissaoRepository;

    public PerfilService(
            PerfilRepository perfilRepository,
            PermissaoRepository permissaoRepository
    ) {
        this.perfilRepository = perfilRepository;
        this.permissaoRepository = permissaoRepository;
    }

    public PerfilResponse cadastrar(PerfilRequest request) {
        String nome = request.nome().trim();

        if (perfilRepository.existsByNome(nome)) {
            throw new BusinessException(
                "Já existe um perfil com este nome"
            );
        }

        Perfil perfil = new Perfil();
        perfil.setNome(nome);
        perfil.setDescricao(request.descricao());

        return toResponse(perfilRepository.save(perfil));
    }

    @Transactional(readOnly = true)
    public List<PerfilResponse> listar() {
        return perfilRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PerfilResponse buscarPorId(UUID id) {
        return toResponse(buscar(id));
    }

    public PerfilResponse atualizar(
            UUID id,
            PerfilRequest request
    ) {
        Perfil perfil = buscar(id);
        String nome = request.nome().trim();

        if (!perfil.getNome().equals(nome)
                && perfilRepository.existsByNome(nome)) {
            throw new BusinessException(
                "Já existe um perfil com este nome"
            );
        }

        perfil.setNome(nome);
        perfil.setDescricao(request.descricao());

        return toResponse(perfil);
    }

    public void atribuirPermissao(
            UUID perfilId,
            UUID permissaoId
    ) {
        Perfil perfil = buscar(perfilId);

        Permissao permissao = permissaoRepository
                .findById(permissaoId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Permissão não encontrada"
                    )
                );

        if (!perfil.getPermissoes().add(permissao)) {
            throw new BusinessException(
                "O perfil já possui esta permissão"
            );
        }
    }

    public void removerPermissao(
            UUID perfilId,
            UUID permissaoId
    ) {
        Perfil perfil = buscar(perfilId);

        Permissao permissao = permissaoRepository
                .findById(permissaoId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Permissão não encontrada"
                    )
                );

        if (!perfil.getPermissoes().remove(permissao)) {
            throw new BusinessException(
                "O perfil não possui esta permissão"
            );
        }
    }

    private Perfil buscar(UUID id) {
        return perfilRepository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Perfil não encontrado"
                    )
                );
    }

    private PerfilResponse toResponse(Perfil perfil) {
        Set<String> permissoes = perfil.getPermissoes()
                .stream()
                .map(Permissao::getCodigo)
                .collect(Collectors.toSet());

        return new PerfilResponse(
            perfil.getId(),
            perfil.getNome(),
            perfil.getDescricao(),
            permissoes
        );
    }
}