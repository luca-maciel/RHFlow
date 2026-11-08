
package rhflow.backend.config;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.entity.postgresql.Perfil;
import rhflow.backend.entity.postgresql.Permissao;
import rhflow.backend.entity.postgresql.Usuario;

import rhflow.backend.repository.postgresql.PerfilRepository;
import rhflow.backend.repository.postgresql.PermissaoRepository;
import rhflow.backend.repository.postgresql.UsuarioRepository;

@Component
public class SuperAdminInitializer implements ApplicationRunner {

    private static final Logger log =
        LoggerFactory.getLogger(SuperAdminInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PermissaoRepository permissaoRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${RHFLOW_ADMIN_NAME:}")
    private String adminName;

    @Value("${RHFLOW_ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${RHFLOW_ADMIN_PASSWORD:}")
    private String adminPassword;

    public SuperAdminInitializer(
            UsuarioRepository usuarioRepository,
            PerfilRepository perfilRepository,
            PermissaoRepository permissaoRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.permissaoRepository = permissaoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {

        Perfil perfil = obterPerfilAdministrador();

        List<Permissao> permissoes =
            permissaoRepository.findAll();

        if (permissoes.isEmpty()) {
            throw new IllegalStateException(
                "Não existem permissões cadastradas no RHFlow."
            );
        }

        // Garante que o administrador tenha todas as permissões.
        perfil.getPermissoes().addAll(permissoes);
        perfilRepository.save(perfil);

        // Evita duplicar o administrador.
        if (usuarioRepository.existsByPerfilNomeIgnoreCase(
                "ADMINISTRADOR")) {

            log.info(
                "Super Admin já cadastrado. Nenhuma conta foi criada."
            );

            return;
        }

        validarConfiguracao();

        String email = adminEmail.trim()
            .toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalStateException(
                "O e-mail configurado para o Super Admin já pertence a outro usuário."
            );
        }

        Usuario administrador = new Usuario();

        administrador.setNome(adminName.trim());
        administrador.setEmail(email);

        // Nunca armazenar a senha original.
        administrador.setSenhaHash(
            passwordEncoder.encode(adminPassword)
        );

        administrador.setAtivo(true);

        administrador.setPerfis(
            new HashSet<>(Set.of(perfil))
        );

        usuarioRepository.save(administrador);

        log.info(
            "Super Admin criado com sucesso: {}",
            email
        );
    }

    private Perfil obterPerfilAdministrador() {

        // Aproveita um possível perfil ADMIN legado.
        Perfil perfil = perfilRepository.findByNome("ADMINISTRADOR")
            .orElseGet(() ->
                perfilRepository.findByNome("ADMIN")
                    .orElse(null)
            );

        if (perfil == null) {

            perfil = new Perfil();

            perfil.setNome("ADMINISTRADOR");
            perfil.setDescricao(
                "Perfil com acesso administrativo completo ao RHFlow."
            );

            perfil = perfilRepository.save(perfil);

        } else if (!perfil.getNome().equals("ADMINISTRADOR")) {

            perfil.setNome("ADMINISTRADOR");

            perfil.setDescricao(
                "Perfil com acesso administrativo completo ao RHFlow."
            );

            perfil = perfilRepository.save(perfil);
        }

        return perfil;
    }

    private void validarConfiguracao() {

        if (adminName == null || adminName.isBlank()) {
            throw new IllegalStateException(
                "Configure a variável RHFLOW_ADMIN_NAME."
            );
        }

        if (adminEmail == null || adminEmail.isBlank()) {
            throw new IllegalStateException(
                "Configure a variável RHFLOW_ADMIN_EMAIL."
            );
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            throw new IllegalStateException(
                "Configure a variável RHFLOW_ADMIN_PASSWORD."
            );
        }

        if (adminPassword.length() < 12) {
            throw new IllegalStateException(
                "A senha do Super Admin deve possuir pelo menos 12 caracteres."
            );
        }
    }
}
