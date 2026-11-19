package rhflow.backend.config;

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

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.core.annotation.Order;

@Component
@Order(1)
public class AdminDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminDataSeeder.class);
    private static final String ADMIN_ROLE_NAME = "ADMINISTRADOR";

    private final PermissaoRepository permissaoRepository;
    private final PerfilRepository perfilRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    private final String adminName;
    private final String adminEmail;
    private final String adminPassword;

    public AdminDataSeeder(
            PermissaoRepository permissaoRepository,
            PerfilRepository perfilRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.name:Administrador RHFlow}") String adminName,
            @Value("${app.admin.email:admin@rhflow.com}") String adminEmail,
            @Value("${app.admin.password:Admin@123}") String adminPassword) {
        this.permissaoRepository = permissaoRepository;
        this.perfilRepository = perfilRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Map<String, String> permissoesPadrao = new LinkedHashMap<>();
        permissoesPadrao.put("EMPRESAS_VISUALIZAR", "Visualizar empresas");
        permissoesPadrao.put("EMPRESAS_GERENCIAR", "Cadastrar, editar e inativar empresas");
        permissoesPadrao.put("DEPARTAMENTOS_VISUALIZAR", "Visualizar departamentos");
        permissoesPadrao.put("DEPARTAMENTOS_GERENCIAR", "Cadastrar, editar e inativar departamentos");
        permissoesPadrao.put("CARGOS_VISUALIZAR", "Visualizar cargos");
        permissoesPadrao.put("CARGOS_GERENCIAR", "Cadastrar, editar e inativar cargos");
        permissoesPadrao.put("FUNCIONARIOS_VISUALIZAR", "Visualizar funcionários");
        permissoesPadrao.put("FUNCIONARIOS_GERENCIAR", "Cadastrar, editar e desligar funcionários");
        permissoesPadrao.put("FERIAS_VISUALIZAR", "Visualizar solicitações de férias");
        permissoesPadrao.put("FERIAS_SOLICITAR", "Solicitar férias");
        permissoesPadrao.put("FERIAS_APROVAR", "Aprovar ou recusar férias");
        permissoesPadrao.put("FERIAS_GERENCIAR", "Gerenciar férias");
        permissoesPadrao.put("DOCUMENTOS_VISUALIZAR", "Visualizar documentos");
        permissoesPadrao.put("DOCUMENTOS_SOLICITAR", "Solicitar documentos");
        permissoesPadrao.put("DOCUMENTOS_GERENCIAR", "Gerenciar documentos");
        permissoesPadrao.put("USUARIOS_VISUALIZAR", "Visualizar usuários");
        permissoesPadrao.put("USUARIOS_GERENCIAR", "Cadastrar, editar e inativar usuários");
        permissoesPadrao.put("PERFIS_VISUALIZAR", "Visualizar perfis");
        permissoesPadrao.put("PERFIS_GERENCIAR", "Cadastrar e editar perfis");
        permissoesPadrao.put("PERMISSOES_VISUALIZAR", "Visualizar permissões");
        permissoesPadrao.put("PERMISSOES_GERENCIAR", "Gerenciar permissões");
        permissoesPadrao.put("AUDITORIA_VISUALIZAR", "Visualizar logs de auditoria");

        for (Map.Entry<String, String> entry : permissoesPadrao.entrySet()) {
            permissaoRepository.findByCodigo(entry.getKey()).orElseGet(() -> {
                Permissao p = new Permissao();
                p.setCodigo(entry.getKey());
                p.setDescricao(entry.getValue());
                return permissaoRepository.save(p);
            });
        }

        List<Permissao> todasPermissoes = permissaoRepository.findAll();

        Perfil adminPerfil = perfilRepository.findByNome(ADMIN_ROLE_NAME).orElseGet(() -> {
            Perfil p = new Perfil();
            p.setNome(ADMIN_ROLE_NAME);
            p.setDescricao("Acesso total ao sistema RHFlow");
            return p;
        });

        adminPerfil.setPermissoes(new HashSet<>(todasPermissoes));
        adminPerfil = perfilRepository.save(adminPerfil);

        if (usuarioRepository.existsByPerfilNomeIgnoreCase(ADMIN_ROLE_NAME)) {
            return;
        }

        String emailNormalizado = adminEmail.trim().toLowerCase(Locale.ROOT);

        Usuario admin = usuarioRepository.findByEmailIgnoreCase(emailNormalizado)
                .orElseGet(() -> {
                    Usuario u = new Usuario();
                    u.setNome(adminName.trim());
                    u.setEmail(emailNormalizado);
                    u.setSenhaHash(passwordEncoder.encode(adminPassword));
                    u.setAtivo(true);
                    return u;
                });

        admin.setAtivo(true);
        admin.setPerfis(new HashSet<>(Set.of(adminPerfil)));
        usuarioRepository.save(admin);

        log.info("==========================================================");
        log.info("Super Admin inicial garantido com sucesso!");
        log.info("E-mail: {}", emailNormalizado);
        log.info("Senha:  {}", adminPassword);
        log.info("==========================================================");
    }
}