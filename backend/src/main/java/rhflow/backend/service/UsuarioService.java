package rhflow.backend.service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.UsuarioRequest;
import rhflow.backend.dto.UsuarioResponse;
import rhflow.backend.dto.UsuarioUpdateRequest;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.entity.postgresql.Perfil;
import rhflow.backend.entity.postgresql.Permissao;
import rhflow.backend.entity.postgresql.Usuario;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.FuncionarioRepository;
import rhflow.backend.repository.postgresql.PerfilRepository;
import rhflow.backend.repository.postgresql.PermissaoRepository;
import rhflow.backend.repository.postgresql.UsuarioRepository;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PermissaoRepository permissaoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PerfilRepository perfilRepository,
            PermissaoRepository permissaoRepository,
            FuncionarioRepository funcionarioRepository,
            PasswordEncoder passwordEncoder,
            AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.permissaoRepository = permissaoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditoriaService = auditoriaService;
    }

    public void atribuirPerfil(UUID usuarioId, UUID perfilId) {
        Usuario usuario = buscarUsuario(usuarioId);

        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado"));

        if (!usuario.getPerfis().add(perfil)) {
            throw new BusinessException("O usuário já possui este perfil");
        }

        auditoriaService.registrar(
                "ATRIBUIR_PERFIL_USUARIO",
                "USUARIO",
                usuario.getId().toString(),
                "Perfil '" + perfil.getNome() + "' atribuído a " + usuario.getNome(),
                Map.of("perfilId", perfil.getId().toString(), "perfil", perfil.getNome())
        );
    }

    public void removerPerfil(UUID usuarioId, UUID perfilId) {
        Usuario usuario = buscarUsuario(usuarioId);

        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado"));

        if (!usuario.getPerfis().remove(perfil)) {
            throw new BusinessException("O usuário não possui este perfil");
        }

        auditoriaService.registrar(
                "REMOVER_PERFIL_USUARIO",
                "USUARIO",
                usuario.getId().toString(),
                "Perfil '" + perfil.getNome() + "' removido de " + usuario.getNome(),
                Map.of("perfilId", perfil.getId().toString(), "perfil", perfil.getNome())
        );
    }

    public void concederPermissao(UUID usuarioId, UUID permissaoId) {
        Usuario usuario = buscarUsuario(usuarioId);

        Permissao permissao = permissaoRepository
                .findById(permissaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada"));

        if (!usuario.getPermissoesIndividuais().add(permissao)) {
            throw new BusinessException("O usuário já possui esta permissão individual");
        }

        auditoriaService.registrar(
                "CONCEDER_PERMISSAO_USUARIO",
                "USUARIO",
                usuario.getId().toString(),
                "Permissão '" + permissao.getCodigo() + "' concedida a " + usuario.getNome(),
                Map.of("permissaoId", permissao.getId().toString(), "codigo", permissao.getCodigo())
        );
    }

    public void revogarPermissao(UUID usuarioId, UUID permissaoId) {
        Usuario usuario = buscarUsuario(usuarioId);

        Permissao permissao = permissaoRepository
                .findById(permissaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada"));

        if (!usuario.getPermissoesIndividuais().remove(permissao)) {
            throw new BusinessException("O usuário não possui esta permissão individual");
        }

        auditoriaService.registrar(
                "REVOGAR_PERMISSAO_USUARIO",
                "USUARIO",
                usuario.getId().toString(),
                "Permissão '" + permissao.getCodigo() + "' revogada de " + usuario.getNome(),
                Map.of("permissaoId", permissao.getId().toString(), "codigo", permissao.getCodigo())
        );
    }

    @Transactional(readOnly = true)
    public Set<String> consultarPermissoes(UUID usuarioId) {
        buscarUsuario(usuarioId);
        return usuarioRepository.findPermissoesEfetivas(usuarioId);
    }

    private Usuario buscarUsuario(UUID usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(UUID id) {
        return toResponse(buscarUsuario(id));
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

        Set<UUID> perfilIds = usuario.getPerfis()
                .stream()
                .map(Perfil::getId)
                .collect(Collectors.toSet());

        Set<UUID> permissaoIdsIndividuais = usuario.getPermissoesIndividuais()
                .stream()
                .map(Permissao::getId)
                .collect(Collectors.toSet());

        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getFuncionario() != null ? usuario.getFuncionario().getId() : null,
                usuario.isAtivo(),
                perfis,
                perfilIds,
                permissaoIdsIndividuais,
                usuario.getCreatedAt(),
                usuario.getUpdatedAt());
    }

    public UsuarioResponse cadastrar(UsuarioRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("Já existe um usuário com este e-mail");
        }

        String senha = request.senha();

        if (senha.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BusinessException("A senha excede o limite de 72 bytes");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(senha));

        if (request.funcionarioId() != null) {
            if (usuarioRepository.existsByFuncionarioId(request.funcionarioId())) {
                throw new BusinessException("Este funcionário já possui uma conta");
            }

            Funcionario funcionario = funcionarioRepository
                    .findById(request.funcionarioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));

            usuario.setFuncionario(funcionario);
        }

        Usuario salvo = usuarioRepository.saveAndFlush(usuario);

        auditoriaService.registrar(
                "CADASTRAR_USUARIO",
                "USUARIO",
                salvo.getId().toString(),
                "Usuário '" + salvo.getNome() + "' (" + salvo.getEmail() + ") cadastrado",
                Map.of("email", salvo.getEmail())
        );

        return toResponse(salvo);
    }

    public UsuarioResponse atualizar(UUID id, UsuarioUpdateRequest request) {
        Usuario usuario = buscarUsuario(id);

        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (!usuario.getEmail().equalsIgnoreCase(email)
                && usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("Já existe um usuário com este e-mail");
        }

        Funcionario funcionario = null;

        if (request.funcionarioId() != null) {
            if (usuarioRepository.existsByFuncionarioId(request.funcionarioId())) {
                if (usuario.getFuncionario() == null
                        || !usuario.getFuncionario().getId().equals(request.funcionarioId())) {
                    throw new BusinessException("Este funcionário já possui uma conta");
                }
            }

            funcionario = funcionarioRepository
                    .findById(request.funcionarioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));
        }

        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setFuncionario(funcionario);

        usuarioRepository.flush();

        auditoriaService.registrar(
                "ATUALIZAR_USUARIO",
                "USUARIO",
                usuario.getId().toString(),
                "Dados do usuário '" + usuario.getNome() + "' (" + usuario.getEmail() + ") atualizados",
                Map.of("email", usuario.getEmail())
        );

        return toResponse(usuario);
    }

    public void desativar(UUID id) {
        Usuario usuario = buscarUsuario(id);

        if (!usuario.isAtivo()) {
            throw new BusinessException("O usuário já está desativado");
        }

        usuario.setAtivo(false);

        auditoriaService.registrar(
                "DESATIVAR_USUARIO",
                "USUARIO",
                usuario.getId().toString(),
                "Usuário '" + usuario.getNome() + "' (" + usuario.getEmail() + ") desativado",
                Map.of("email", usuario.getEmail())
        );
    }

    public void ativar(UUID id) {
        Usuario usuario = buscarUsuario(id);

        if (usuario.isAtivo()) {
            throw new BusinessException("O usuário já está ativo");
        }

        usuario.setAtivo(true);

        auditoriaService.registrar(
                "ATIVAR_USUARIO",
                "USUARIO",
                usuario.getId().toString(),
                "Usuário '" + usuario.getNome() + "' (" + usuario.getEmail() + ") reativado",
                Map.of("email", usuario.getEmail())
        );
    }

    public void alterarSenha(UUID id, String novaSenha) {
        Usuario usuario = buscarUsuario(id);

        if (novaSenha == null || novaSenha.trim().length() < 8) {
            throw new BusinessException("A nova senha deve possuir pelo menos 8 caracteres.");
        }

        if (novaSenha.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BusinessException("A senha excede o limite de 72 bytes.");
        }

        usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
        usuarioRepository.flush();

        auditoriaService.registrar(
                "ALTERAR_SENHA_USUARIO",
                "USUARIO",
                usuario.getId().toString(),
                "Senha do usuário " + usuario.getNome() + " (" + usuario.getEmail() + ") alterada pelo administrador",
                Map.of(
                        "usuarioAlvoId", usuario.getId().toString(),
                        "usuarioAlvoEmail", usuario.getEmail()
                )
        );
    }
}