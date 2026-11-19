package rhflow.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rhflow.backend.entity.postgresql.*;
import rhflow.backend.enums.StatusContrato;
import rhflow.backend.enums.StatusFerias;
import rhflow.backend.enums.StatusFuncionario;
import rhflow.backend.repository.postgresql.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Order(2)
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final boolean enabled;
    private final EmpresaRepository empresaRepository;
    private final DepartamentoRepository departamentoRepository;
    private final CargoRepository cargoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ContratoRepository contratoRepository;
    private final FeriasRepository feriasRepository;
    private final PerfilRepository perfilRepository;
    private final PermissaoRepository permissaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
            @Value("${app.demo-seed.enabled:true}") boolean enabled,
            EmpresaRepository empresaRepository,
            DepartamentoRepository departamentoRepository,
            CargoRepository cargoRepository,
            FuncionarioRepository funcionarioRepository,
            ContratoRepository contratoRepository,
            FeriasRepository feriasRepository,
            PerfilRepository perfilRepository,
            PermissaoRepository permissaoRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.enabled = enabled;
        this.empresaRepository = empresaRepository;
        this.departamentoRepository = departamentoRepository;
        this.cargoRepository = cargoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.contratoRepository = contratoRepository;
        this.feriasRepository = feriasRepository;
        this.perfilRepository = perfilRepository;
        this.permissaoRepository = permissaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled || empresaRepository.count() > 0) {
            return;
        }

        LocalDate hoje = LocalDate.now();
        LocalDate inicioMesAtual = hoje.withDayOfMonth(1);

        // =====================================================================
        // 1. EMPRESAS
        // =====================================================================
        Empresa nordesteTech = criarEmpresa(
                "Nordeste Tech Soluções Digitais S.A.",
                "Nordeste Tech Matriz",
                "12345678000190",
                "contato@nordestetech.com.br",
                "(81) 3321-4400",
                true
        );

        Empresa sertaoLog = criarEmpresa(
                "Sertão Logística & Operações Ltda",
                "Sertão Log Filial PE",
                "98765432000155",
                "rh@sertaolog.com.br",
                "(87) 3821-1900",
                true
        );

        Empresa unidadeInativa = criarEmpresa(
                "Agreste Consultoria Empresarial Ltda",
                "Agreste Consultoria (Unidade Encerrada)",
                "45678912000133",
                "arquivo@agresteconsult.com.br",
                "(81) 3721-9000",
                false
        );

        // =====================================================================
        // 2. DEPARTAMENTOS
        // =====================================================================
        Departamento depTi = criarDepartamento(nordesteTech, "Tecnologia da Informação", "Desenvolvimento de software, arquitetura e infraestrutura em nuvem", true);
        Departamento depRh = criarDepartamento(nordesteTech, "Recursos Humanos", "Recrutamento, departamento pessoal, treinamento e cultura", true);
        Departamento depFin = criarDepartamento(nordesteTech, "Financeiro e Controladoria", "Contabilidade, folha de pagamento, tesouraria e planejamento", true);
        Departamento depProd = criarDepartamento(nordesteTech, "Engenharia de Produto", "Product Management, UX/UI Design e pesquisa com usuários", true);
        Departamento depCom = criarDepartamento(nordesteTech, "Comercial e Marketing", "Vendas corporativas B2B, pré-vendas e branding", true);
        Departamento depJur = criarDepartamento(nordesteTech, "Jurídico e Compliance", "Contratos trabalhistas, LGPD e governança corporativa", true);

        Departamento depOps = criarDepartamento(sertaoLog, "Operações e Logística", "Gestão de frota, roteirização e centros de distribuição", true);
        Departamento depAtend = criarDepartamento(sertaoLog, "Atendimento ao Cliente", "Suporte operacional, SAC e pós-venda regional", true);
        Departamento depAdmFilial = criarDepartamento(sertaoLog, "Administração Regional", "Gestão administrativa e facilities da unidade interior", true);

        criarDepartamento(unidadeInativa, "Consultoria Geral", "Departamento desativado após incorporação", false);

        // =====================================================================
        // 3. CARGOS
        // =====================================================================
        Cargo devFullStackSr = criarCargo(depTi, "Desenvolvedor Full Stack", "Desenvolvimento Java/Spring Boot e React/TypeScript", "Sênior", new BigDecimal("9800.00"));
        Cargo devBackendPl = criarCargo(depTi, "Desenvolvedor Back-End", "APIs REST, microsserviços e bancos relacionais/NoSQL", "Pleno", new BigDecimal("7200.00"));
        Cargo devFrontendJr = criarCargo(depTi, "Desenvolvedor Front-End", "Interfaces web responsivas e acessibilidade", "Júnior", new BigDecimal("4500.00"));
        Cargo devOpsEsp = criarCargo(depTi, "Engenheiro DevOps", "CI/CD, containers, observabilidade e segurança em nuvem", "Especialista", new BigDecimal("11200.00"));

        Cargo gerenteRh = criarCargo(depRh, "Gerente de Recursos Humanos", "Gestão estratégica de pessoas, cargos e salários", "Gerência", new BigDecimal("10500.00"));
        Cargo analistaRhPl = criarCargo(depRh, "Analista de Departamento Pessoal", "Admissões, férias, benefícios e conformidade trabalhista", "Pleno", new BigDecimal("5400.00"));
        Cargo estagiarioRh = criarCargo(depRh, "Estagiário de RH", "Apoio em triagem de currículos e onboarding", "Estágio", new BigDecimal("1600.00"));

        Cargo coordFin = criarCargo(depFin, "Coordenador Financeiro", "Fechamento contábil, fluxo de caixa e auditoria", "Coordenação", new BigDecimal("8900.00"));
        Cargo analistaFinJr = criarCargo(depFin, "Analista Financeiro", "Contas a pagar/receber e conciliação bancária", "Júnior", new BigDecimal("4200.00"));

        Cargo productDesigner = criarCargo(depProd, "Product Designer UX/UI", "Design systems, prototipação e testes de usabilidade", "Pleno", new BigDecimal("6800.00"));
        Cargo productManager = criarCargo(depProd, "Product Manager", "Roadmap de produto, métricas e descoberta contínua", "Sênior", new BigDecimal("11500.00"));

        Cargo execVendas = criarCargo(depCom, "Executivo de Contas B2B", "Prospecção e fechamento de contratos enterprise", "Pleno", new BigDecimal("6100.00"));
        Cargo advogadoPl = criarCargo(depJur, "Advogado Trabalhista e LGPD", "Consultoria preventiva, contratos e proteção de dados", "Pleno", new BigDecimal("8400.00"));

        Cargo supLogistica = criarCargo(depOps, "Supervisor de Operações Logísticas", "Coordenação de expedição, estoque e indicadores SLA", "Coordenação", new BigDecimal("6700.00"));
        Cargo analistaLog = criarCargo(depOps, "Analista de Logística", "Controle de inventário, fretes e rastreamento", "Pleno", new BigDecimal("4300.00"));
        Cargo analistaSuporte = criarCargo(depAtend, "Analista de Suporte ao Cliente", "Atendimento multicanal e resolução de ocorrências", "Júnior", new BigDecimal("3100.00"));
        Cargo auxAdm = criarCargo(depAdmFilial, "Assistente Administrativo", "Rotinas administrativas e controle documental", "Júnior", new BigDecimal("2950.00"));

        // =====================================================================
        // 4. FUNCIONÁRIOS + CONTRATOS
        // =====================================================================
        Funcionario f1 = criarFuncionario(gerenteRh, "Mariana Albuquerque Vasconcelos", "10482937401", "7845120",
                LocalDate.of(1988, 4, 14), "mariana.vasconcelos@nordestetech.com.br", "(81) 99812-3301",
                LocalDate.of(2021, 3, 10), null, StatusFuncionario.ATIVO);
        criarContrato(f1, "CLT", LocalDate.of(2021, 3, 10), null, StatusContrato.ATIVO, "Contrato por prazo indeterminado - Liderança RH");

        Funcionario f2 = criarFuncionario(analistaRhPl, "Camila Bezerra Cavalcanti", "21938475612", "8123490",
                LocalDate.of(1994, hoje.getMonthValue(), 12), "camila.cavalcanti@nordestetech.com.br", "(81) 99744-1120",
                LocalDate.of(2022, 8, 1), null, StatusFuncionario.ATIVO);
        criarContrato(f2, "CLT", LocalDate.of(2022, 8, 1), null, StatusContrato.ATIVO, "Analista Pleno - Departamento Pessoal");

        Funcionario f3 = criarFuncionario(estagiarioRh, "Pedro Henrique Siqueira", "32847561923", "9451203",
                LocalDate.of(2003, 9, 25), "pedro.siqueira@nordestetech.com.br", "(81) 99102-8844",
                inicioMesAtual.plusDays(2), null, StatusFuncionario.ATIVO);
        criarContrato(f3, "ESTAGIO", inicioMesAtual.plusDays(2), inicioMesAtual.plusYears(1), StatusContrato.ATIVO, "Termo de Compromisso de Estágio - 30h semanais");

        Funcionario f4 = criarFuncionario(devFullStackSr, "Rafael Monteiro de Andrade", "43756192834", "6543219",
                LocalDate.of(1991, 2, 19), "rafael.andrade@nordestetech.com.br", "(81) 99655-7710",
                LocalDate.of(2021, 6, 15), null, StatusFuncionario.ATIVO);
        criarContrato(f4, "CLT", LocalDate.of(2021, 6, 15), LocalDate.of(2023, 5, 31), StatusContrato.ENCERRADO, "Desenvolvedor Full Stack Pleno (Promoção)");
        criarContrato(f4, "CLT", LocalDate.of(2023, 6, 1), null, StatusContrato.ATIVO, "Promoção para Desenvolvedor Full Stack Sênior");

        Funcionario f5 = criarFuncionario(devBackendPl, "Lucas Ferreira Maciel", "54619283745", "8874123",
                LocalDate.of(1998, 1, 30), "lucas.maciel@nordestetech.com.br", "(87) 99914-5520",
                LocalDate.of(2023, 2, 6), null, StatusFuncionario.ATIVO);
        criarContrato(f5, "CLT", LocalDate.of(2023, 2, 6), null, StatusContrato.ATIVO, "Engenharia de Software Back-End");

        Funcionario f6 = criarFuncionario(devFrontendJr, "Beatriz Nogueira Tavares", "65192837456", "9102938",
                LocalDate.of(2000, hoje.getMonthValue(), 24), "beatriz.tavares@nordestetech.com.br", "(81) 99511-4090",
                inicioMesAtual.plusDays(4), null, StatusFuncionario.ATIVO);
        criarContrato(f6, "CLT", inicioMesAtual.plusDays(4), null, StatusContrato.ATIVO, "Desenvolvimento Front-End React/TypeScript");

        Funcionario f7 = criarFuncionario(devOpsEsp, "Thiago Tavares de Melo", "76928374567", "5982341",
                LocalDate.of(1989, 7, 8), "thiago.melo@nordestetech.com.br", "(81) 99402-6611",
                LocalDate.of(2022, 1, 17), null, StatusFuncionario.FERIAS);
        criarContrato(f7, "PJ", LocalDate.of(2022, 1, 17), null, StatusContrato.ATIVO, "Prestação de Serviços Especializados Cloud & SRE");

        Funcionario f8 = criarFuncionario(coordFin, "Fernanda Lima de Queiroz", "87283745678", "7123984",
                LocalDate.of(1987, 10, 3), "fernanda.queiroz@nordestetech.com.br", "(81) 99322-9012",
                LocalDate.of(2020, 11, 9), null, StatusFuncionario.ATIVO);
        criarContrato(f8, "CLT", LocalDate.of(2020, 11, 9), null, StatusContrato.ATIVO, "Coordenação Financeira e Controladoria");

        Funcionario f9 = criarFuncionario(analistaFinJr, "Gabriel Barros Lins", "98374567890", "8456129",
                LocalDate.of(1997, 5, 21), "gabriel.lins@nordestetech.com.br", "(81) 99210-3498",
                LocalDate.of(2024, 4, 1), null, StatusFuncionario.AFASTADO);
        criarContrato(f9, "CLT", LocalDate.of(2024, 4, 1), null, StatusContrato.ATIVO, "Afastamento médico previdenciário temporário");

        Funcionario f10 = criarFuncionario(productManager, "Juliana Wanderley Borba", "11223344556", "6789123",
                LocalDate.of(1990, 12, 15), "juliana.borba@nordestetech.com.br", "(81) 99877-2233",
                LocalDate.of(2022, 5, 2), null, StatusFuncionario.ATIVO);
        criarContrato(f10, "CLT", LocalDate.of(2022, 5, 2), null, StatusContrato.ATIVO, "Liderança de Produto Digital");

        Funcionario f11 = criarFuncionario(productDesigner, "Larissa Costa Galvão", "22334455667", "7891234",
                LocalDate.of(1995, 3, 28), "larissa.galvao@nordestetech.com.br", "(81) 99766-1144",
                LocalDate.of(2023, 9, 11), null, StatusFuncionario.FERIAS);
        criarContrato(f11, "CLT", LocalDate.of(2023, 9, 11), null, StatusContrato.ATIVO, "Design de Produto e Pesquisa UX");

        Funcionario f12 = criarFuncionario(execVendas, "Rodrigo Guimarães Paiva", "33445566778", "8912345",
                LocalDate.of(1992, 6, 17), "rodrigo.paiva@nordestetech.com.br", "(81) 99655-0099",
                LocalDate.of(2023, 4, 3), null, StatusFuncionario.ATIVO);
        criarContrato(f12, "CLT", LocalDate.of(2023, 4, 3), null, StatusContrato.ATIVO, "Comercial B2B - Contas Corporativas");

        Funcionario f13 = criarFuncionario(advogadoPl, "Dr. Henrique Figueiredo Neto", "44556677889", "5432198",
                LocalDate.of(1986, 8, 29), "henrique.neto@nordestetech.com.br", "(81) 99544-8877",
                LocalDate.of(2022, 10, 10), null, StatusFuncionario.ATIVO);
        criarContrato(f13, "CLT", LocalDate.of(2022, 10, 10), null, StatusContrato.ATIVO, "Jurídico Trabalhista e Encarregado LGPD (DPO)");

        // Filial Sertão Log
        Funcionario f14 = criarFuncionario(supLogistica, "Carlos Eduardo Tenório", "55667788990", "6321987",
                LocalDate.of(1985, hoje.getMonthValue(), 7), "carlos.tenorio@sertaolog.com.br", "(87) 99988-1234",
                LocalDate.of(2021, 7, 19), null, StatusFuncionario.ATIVO);
        criarContrato(f14, "CLT", LocalDate.of(2021, 7, 19), null, StatusContrato.ATIVO, "Supervisão Centro de Distribuição Arcoverde");

        Funcionario f15 = criarFuncionario(analistaLog, "Amanda Cristina Sobral", "66778899001", "7412589",
                LocalDate.of(1996, 11, 2), "amanda.sobral@sertaolog.com.br", "(87) 99877-4567",
                LocalDate.of(2023, 11, 13), null, StatusFuncionario.ATIVO);
        criarContrato(f15, "CLT", LocalDate.of(2023, 11, 13), null, StatusContrato.ATIVO, "Planejamento de Rotas e Frota");

        Funcionario f16 = criarFuncionario(analistaSuporte, "Matheus Vinicius Freitas", "77889900112", "8523697",
                LocalDate.of(1999, 4, 18), "matheus.freitas@sertaolog.com.br", "(87) 99766-7890",
                inicioMesAtual.plusDays(6), null, StatusFuncionario.ATIVO);
        criarContrato(f16, "CLT", inicioMesAtual.plusDays(6), null, StatusContrato.ATIVO, "Atendimento e Suporte ao Cliente Regional");

        Funcionario f17 = criarFuncionario(auxAdm, "Patrícia Helena Moura", "88990011223", "9632587",
                LocalDate.of(1993, 9, 5), "patricia.moura@sertaolog.com.br", "(87) 99655-3210",
                LocalDate.of(2022, 2, 14), null, StatusFuncionario.AFASTADO);
        criarContrato(f17, "CLT", LocalDate.of(2022, 2, 14), null, StatusContrato.ATIVO, "Licença maternidade");

        Funcionario f18 = criarFuncionario(analistaSuporte, "Diego Renan Barros", "99001122334", "4569871",
                LocalDate.of(1995, 1, 11), "diego.barros@sertaolog.com.br", "(87) 99544-6543",
                LocalDate.of(2023, 1, 9), LocalDate.of(2026, 9, 30), StatusFuncionario.DESLIGADO);
        f18.setAtivo(false);
        funcionarioRepository.save(f18);
        criarContrato(f18, "CLT", LocalDate.of(2023, 1, 9), LocalDate.of(2026, 9, 30), StatusContrato.ENCERRADO, "Desligamento a pedido do colaborador");

        // =====================================================================
        // 5. FÉRIAS (DIVERSOS STATUS PARA DEMONSTRAÇÃO)
        // =====================================================================
        criarFerias(f7, LocalDate.of(2025, 1, 17), LocalDate.of(2026, 1, 16),
                hoje.minusDays(5), hoje.plusDays(14), 20, StatusFerias.EM_GOZO,
                "Férias anuais programadas - cobertura pela equipe SRE");

        criarFerias(f11, LocalDate.of(2025, 9, 11), LocalDate.of(2026, 9, 10),
                hoje.minusDays(3), hoje.plusDays(11), 15, StatusFerias.EM_GOZO,
                "Primeiro período de descanso 2026");

        criarFerias(f4, LocalDate.of(2025, 6, 15), LocalDate.of(2026, 6, 14),
                hoje.plusDays(20), hoje.plusDays(34), 15, StatusFerias.APROVADA,
                "Férias aprovadas pela diretoria de tecnologia");

        criarFerias(f5, LocalDate.of(2025, 2, 6), LocalDate.of(2026, 2, 5),
                hoje.plusDays(30), hoje.plusDays(49), 20, StatusFerias.SOLICITADA,
                "Solicitação aguardando validação do gestor de TI");

        criarFerias(f2, LocalDate.of(2025, 8, 1), LocalDate.of(2026, 7, 31),
                hoje.plusDays(45), hoje.plusDays(59), 15, StatusFerias.SOLICITADA,
                "Período solicitado após fechamento da folha anual");

        criarFerias(f14, LocalDate.of(2025, 7, 19), LocalDate.of(2026, 7, 18),
                hoje.plusDays(15), hoje.plusDays(29), 15, StatusFerias.SOLICITADA,
                "Solicitação pendente - escala operacional da filial");

        criarFerias(f8, LocalDate.of(2024, 11, 9), LocalDate.of(2025, 11, 8),
                LocalDate.of(2026, 3, 2), LocalDate.of(2026, 3, 21), 20, StatusFerias.CONCLUIDA,
                "Período aquisitivo 2024/2025 quitado");

        criarFerias(f12, LocalDate.of(2025, 4, 3), LocalDate.of(2026, 4, 2),
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 15), 15, StatusFerias.REJEITADA,
                "Rejeitada devido ao fechamento comercial trimestral; reagendada");

        // =====================================================================
        // 6. PERFIS RBAC & USUÁRIOS ADICIONAIS (SENHA PADRÃO: Rhflow@123)
        // =====================================================================
        Perfil perfilRh = criarPerfilComCodigos(
                "ANALISTA_RH",
                "Operação completa de RH, funcionários, férias e documentos",
                Set.of(
                        "EMPRESAS_VISUALIZAR", "DEPARTAMENTOS_VISUALIZAR", "CARGOS_VISUALIZAR",
                        "FUNCIONARIOS_VISUALIZAR", "FUNCIONARIOS_GERENCIAR",
                        "FERIAS_VISUALIZAR", "FERIAS_SOLICITAR", "FERIAS_APROVAR", "FERIAS_GERENCIAR",
                        "DOCUMENTOS_VISUALIZAR", "DOCUMENTOS_SOLICITAR", "DOCUMENTOS_GERENCIAR"
                )
        );

        Perfil perfilGestor = criarPerfilComCodigos(
                "GESTOR",
                "Visualização de equipe e aprovação de férias",
                Set.of(
                        "EMPRESAS_VISUALIZAR", "DEPARTAMENTOS_VISUALIZAR", "CARGOS_VISUALIZAR",
                        "FUNCIONARIOS_VISUALIZAR",
                        "FERIAS_VISUALIZAR", "FERIAS_APROVAR",
                        "DOCUMENTOS_VISUALIZAR"
                )
        );

        Perfil perfilColaborador = criarPerfilComCodigos(
                "COLABORADOR",
                "Acesso básico para consulta e solicitação de férias/documentos",
                Set.of(
                        "FUNCIONARIOS_VISUALIZAR",
                        "FERIAS_VISUALIZAR", "FERIAS_SOLICITAR",
                        "DOCUMENTOS_VISUALIZAR", "DOCUMENTOS_SOLICITAR"
                )
        );

        String senhaDemoHash = passwordEncoder.encode("Rhflow@123");

        criarUsuarioDemo(f1, "Mariana Vasconcelos", "mariana.rh@rhflow.com", senhaDemoHash, true, Set.of(perfilRh));
        criarUsuarioDemo(f2, "Camila Cavalcanti", "camila.dp@rhflow.com", senhaDemoHash, true, Set.of(perfilRh));
        criarUsuarioDemo(f4, "Rafael Andrade", "rafael.gestor@rhflow.com", senhaDemoHash, true, Set.of(perfilGestor));
        criarUsuarioDemo(f5, "Lucas Maciel", "lucas.dev@rhflow.com", senhaDemoHash, true, Set.of(perfilColaborador));

        log.info("==========================================================");
        log.info("Massa de dados de demonstração carregada com sucesso!");
        log.info("Empresas: 3 | Departamentos: 10 | Cargos: 17 | Colaboradores: 18");
        log.info("Usuários demo (Senha: Rhflow@123): mariana.rh@rhflow.com, rafael.gestor@rhflow.com, lucas.dev@rhflow.com");
        log.info("==========================================================");
    }

    private Empresa criarEmpresa(String razaoSocial, String nome, String cnpj, String email, String telefone, boolean ativo) {
        Empresa e = new Empresa();
        e.setRazaoSocial(razaoSocial);
        e.setNome(nome);
        e.setCnpj(cnpj);
        e.setEmail(email);
        e.setTelefone(telefone);
        e.setAtivo(ativo);
        return empresaRepository.save(e);
    }

    private Departamento criarDepartamento(Empresa empresa, String nome, String descricao, boolean ativo) {
        Departamento d = new Departamento();
        d.setEmpresa(empresa);
        d.setNome(nome);
        d.setDescricao(descricao);
        d.setAtivo(ativo);
        return departamentoRepository.save(d);
    }

    private Cargo criarCargo(Departamento departamento, String nome, String descricao, String nivel, BigDecimal salarioBase) {
        Cargo c = new Cargo();
        c.setDepartamento(departamento);
        c.setNome(nome);
        c.setDescricao(descricao);
        c.setNivel(nivel);
        c.setSalarioBase(salarioBase);
        c.setAtivo(true);
        return cargoRepository.save(c);
    }

    private Funcionario criarFuncionario(
            Cargo cargo, String nome, String cpf, String rg,
            LocalDate nascimento, String email, String telefone,
            LocalDate admissao, LocalDate demissao, StatusFuncionario status) {
        Funcionario f = new Funcionario();
        f.setCargo(cargo);
        f.setNome(nome);
        f.setCpf(cpf);
        f.setRg(rg);
        f.setDataNascimento(nascimento);
        f.setEmail(email);
        f.setTelefone(telefone);
        f.setDataAdmissao(admissao);
        f.setDataDemissao(demissao);
        f.setStatus(status);
        f.setAtivo(status != StatusFuncionario.DESLIGADO);
        return funcionarioRepository.save(f);
    }

    private void criarContrato(Funcionario funcionario, String tipo, LocalDate inicio, LocalDate fim, StatusContrato status, String descricao) {
        Contrato c = new Contrato();
        c.setFuncionario(funcionario);
        c.setTipo(tipo);
        c.setDataInicio(inicio);
        c.setDataFim(fim);
        c.setStatus(status);
        c.setDescricao(descricao);
        contratoRepository.save(c);
    }

    private void criarFerias(
            Funcionario funcionario, LocalDate inicioAq, LocalDate fimAq,
            LocalDate inicioGozo, LocalDate fimGozo, int dias,
            StatusFerias status, String observacao) {
        Ferias f = new Ferias();
        f.setFuncionario(funcionario);
        f.setInicioPeriodoAquisitivo(inicioAq);
        f.setFimPeriodoAquisitivo(fimAq);
        f.setInicioGozo(inicioGozo);
        f.setFimGozo(fimGozo);
        f.setQuantidadeDias(dias);
        f.setStatus(status);
        f.setObservacao(observacao);
        feriasRepository.save(f);
    }

    private Perfil criarPerfilComCodigos(String nome, String descricao, Set<String> codigos) {
        Perfil perfil = perfilRepository.findByNome(nome).orElseGet(() -> {
            Perfil p = new Perfil();
            p.setNome(nome);
            p.setDescricao(descricao);
            return p;
        });

        List<Permissao> permissoes = permissaoRepository.findAll().stream()
                .filter(p -> codigos.contains(p.getCodigo()))
                .collect(Collectors.toList());

        perfil.setPermissoes(new HashSet<>(permissoes));
        return perfilRepository.save(perfil);
    }

    private void criarUsuarioDemo(Funcionario funcionario, String nome, String email, String senhaHash, boolean ativo, Set<Perfil> perfis) {
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            return;
        }
        Usuario u = new Usuario();
        u.setFuncionario(funcionario);
        u.setNome(nome);
        u.setEmail(email);
        u.setSenhaHash(senhaHash);
        u.setAtivo(ativo);
        u.setPerfis(new HashSet<>(perfis));
        usuarioRepository.save(u);
    }
}