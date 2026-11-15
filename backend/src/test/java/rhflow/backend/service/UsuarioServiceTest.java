package rhflow.backend.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import rhflow.backend.dto.UsuarioRequest;
import rhflow.backend.dto.UsuarioResponse;
import rhflow.backend.entity.postgresql.Usuario;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.repository.postgresql.FuncionarioRepository;
import rhflow.backend.repository.postgresql.PerfilRepository;
import rhflow.backend.repository.postgresql.PermissaoRepository;
import rhflow.backend.repository.postgresql.UsuarioRepository;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PerfilRepository perfilRepository;

    @Mock
    private PermissaoRepository permissaoRepository;

    @Mock
    private FuncionarioRepository funcionarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    @DisplayName("Deve cadastrar usuário armazenando senha criptografada com BCrypt")
    void deveCadastrarUsuarioComSenhaCriptografada() {
        UsuarioRequest request = new UsuarioRequest("Maria Silva", "maria@rhflow.com", "SenhaForte123", null);

        when(usuarioRepository.existsByEmailIgnoreCase("maria@rhflow.com")).thenReturn(false);
        when(passwordEncoder.encode("SenhaForte123")).thenReturn("$2a$10$hashBcryptSimulado");
        when(usuarioRepository.saveAndFlush(any(Usuario.class))).thenAnswer(inv -> {
            Usuario u = inv.getArgument(0);
            ReflectionTestUtils.setField(u, "id", UUID.randomUUID());
            return u;
        });

        UsuarioResponse response = usuarioService.cadastrar(request);

        assertNotNull(response);
        assertEquals("maria@rhflow.com", response.email());
        verify(passwordEncoder, times(1)).encode("SenhaForte123");
    }

    @Test
    @DisplayName("Deve bloquear cadastro com e-mail já existente")
    void deveBloquearEmailDuplicado() {
        UsuarioRequest request = new UsuarioRequest("Maria Silva", "maria@rhflow.com", "SenhaForte123", null);

        when(usuarioRepository.existsByEmailIgnoreCase("maria@rhflow.com")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> usuarioService.cadastrar(request));
        assertEquals("Já existe um usuário com este e-mail", ex.getMessage());
        verify(usuarioRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Deve permitir administrador redefinir senha aplicando hash e registrando auditoria")
    void deveAlterarSenhaUsuarioComAuditoria() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = new Usuario();
        ReflectionTestUtils.setField(usuario, "id", usuarioId);
        usuario.setNome("João Souza");
        usuario.setEmail("joao@rhflow.com");

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("NovaSenha2026")).thenReturn("$2a$10$novoHash");

        usuarioService.alterarSenha(usuarioId, "NovaSenha2026");

        assertEquals("$2a$10$novoHash", usuario.getSenhaHash());
        verify(usuarioRepository, times(1)).flush();
        verify(auditoriaService, times(1)).registrar(
                eq("ALTERAR_SENHA_USUARIO"),
                eq("USUARIO"),
                eq(usuarioId.toString()),
                anyString(),
                anyMap()
        );
    }
}