package rhflow.backend.service;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.UsuarioRequest;
import rhflow.backend.dto.UsuarioResponse;
import rhflow.backend.dto.UsuarioUpdateRequest;
import rhflow.backend.entity.postgresql.Usuario;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.entity.postgresql.Perfil;
import rhflow.backend.entity.postgresql.Permissao;

import rhflow.backend.repository.postgresql.UsuarioRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;
import rhflow.backend.repository.postgresql.PerfilRepository;
import rhflow.backend.repository.postgresql.PermissaoRepository;

import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.exception.BusinessException;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PermissaoRepository permissaoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PerfilRepository perfilRepository,
            PermissaoRepository permissaoRepository,
            FuncionarioRepository funcionarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.permissaoRepository = permissaoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void atribuirPerfil(
            UUID usuarioId,
            UUID perfilId
    ) {
        Usuario usuario = buscarUsuario(usuarioId);

        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Perfil não encontrado"
                        )
                );

        if (!usuario.getPerfis().add(perfil)) {
            throw new BusinessException(
                    "O usuário já possui este perfil"
            );
        }
    }

    public void removerPerfil(
            UUID usuarioId,
            UUID perfilId
    ) {
        Usuario usuario = buscarUsuario(usuarioId);

        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Perfil não encontrado"
                        )
                );

        if (!usuario.getPerfis().remove(perfil)) {
            throw new BusinessException(
                    "O usuário não possui este perfil"
            );
        }
    }

    public void concederPermissao(
            UUID usuarioId,
            UUID permissaoId
    ) {
        Usuario usuario = buscarUsuario(usuarioId);

        Permissao permissao = permissaoRepository
                .findById(permissaoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Permissão não encontrada"
                        )
                );

        if (!usuario.getPermissoesIndividuais().add(permissao)) {
            throw new BusinessException(
                    "O usuário já possui esta permissão individual"
            );
        }
    }

    public void revogarPermissao(
            UUID usuarioId,
            UUID permissaoId
    ) {
        Usuario usuario = buscarUsuario(usuarioId);

        Permissao permissao = permissaoRepository
                .findById(permissaoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Permissão não encontrada"
                        )
                );

        if (!usuario.getPermissoesIndividuais().remove(permissao)) {
            throw new BusinessException(
                    "O usuário não possui esta permissão individual"
            );
        }
    }

    @Transactional(readOnly = true)
    public Set<String> consultarPermissoes(UUID usuarioId) {
        buscarUsuario(usuarioId);

        return usuarioRepository
                .findPermissoesEfetivas(usuarioId);
    }

    private Usuario buscarUsuario(UUID usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado"
                        )
                );
    }

    @Transactional(readOnly = true)
public UsuarioResponse buscarPorId(UUID id) {

    Usuario usuario = buscarUsuario(id);

    return toResponse(usuario);
}

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {

        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private UsuarioResponse toResponse(Usuario usuario) {

        Set<String> perfis = usuario.getPerfis()
                .stream()
                .map(Perfil::getNome)
                .collect(Collectors.toSet());

        UUID funcionarioId = usuario.getFuncionario() != null
                ? usuario.getFuncionario().getId()
                : null;

        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                funcionarioId,
                usuario.isAtivo(),
                perfis,
                usuario.getCreatedAt(),
                usuario.getUpdatedAt());
    }
 
    public UsuarioResponse cadastrar(UsuarioRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException(
                    "Já existe um usuário com este e-mail");
        }

        String senha = request.senha();

        if (senha.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BusinessException(
                    "A senha excede o limite de 72 bytes");
        }

        Usuario usuario = new Usuario();

        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(senha));

        if (request.funcionarioId() != null) {

            if (usuarioRepository.existsByFuncionarioId(
                    request.funcionarioId())) {
                throw new BusinessException(
                        "Este funcionário já possui uma conta");
            }

            Funcionario funcionario = funcionarioRepository
                    .findById(request.funcionarioId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Funcionário não encontrado"));

            usuario.setFuncionario(funcionario);
        }

        Usuario salvo = usuarioRepository.saveAndFlush(usuario);

        return toResponse(salvo);
    }
    
    public UsuarioResponse atualizar(
            UUID id,
            UsuarioUpdateRequest request) {
        Usuario usuario = buscarUsuario(id);

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (!usuario.getEmail().equalsIgnoreCase(email)
                && usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException(
                    "Já existe um usuário com este e-mail");
        }

        Funcionario funcionario = null;

        if (request.funcionarioId() != null) {

            if (usuarioRepository.existsByFuncionarioId(
                    request.funcionarioId())) {
                if (usuario.getFuncionario() == null
                        || !usuario.getFuncionario().getId()
                                .equals(request.funcionarioId())) {
                    throw new BusinessException(
                            "Este funcionário já possui uma conta");
                }
            }

            funcionario = funcionarioRepository
                    .findById(request.funcionarioId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Funcionário não encontrado"));
        }

        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setFuncionario(funcionario);

        usuarioRepository.flush();

        return toResponse(usuario);
    }

    public void desativar(UUID id) {
        Usuario usuario = buscarUsuario(id);

        if (!usuario.isAtivo()) {
            throw new BusinessException(
                    "O usuário já está desativado");
        }

        usuario.setAtivo(false);
    }

    public void ativar(UUID id) {
        Usuario usuario = buscarUsuario(id);

        if (usuario.isAtivo()) {
            throw new BusinessException(
                    "O usuário já está ativo");
        }

        usuario.setAtivo(true);
    }
    
}