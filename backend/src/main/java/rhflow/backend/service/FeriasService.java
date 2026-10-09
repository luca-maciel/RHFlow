package rhflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.dto.FeriasRequest;
import rhflow.backend.dto.FeriasResponse;
import rhflow.backend.entity.postgresql.Ferias;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.enums.StatusFerias;
import rhflow.backend.enums.StatusFuncionario;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.FeriasRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;

import rhflow.backend.dto.MinhasFeriasRequest;
import rhflow.backend.entity.postgresql.Usuario;
import rhflow.backend.repository.postgresql.UsuarioRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FeriasService {

        private final FeriasRepository feriasRepository;
        private final FuncionarioRepository funcionarioRepository;
        private final UsuarioRepository usuarioRepository;

        public FeriasService(
                        FeriasRepository feriasRepository,
                        FuncionarioRepository funcionarioRepository,
                        UsuarioRepository usuarioRepository) {
                this.feriasRepository = feriasRepository;
                this.funcionarioRepository = funcionarioRepository;
                this.usuarioRepository = usuarioRepository;
        }

        public FeriasResponse solicitar(
                        FeriasRequest request) {
                Funcionario funcionario = funcionarioRepository
                                .findById(
                                                request.getFuncionarioId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Funcionário não encontrado."));

                return criarSolicitacao(
                                funcionario,
                                request.getInicioPeriodoAquisitivo(),
                                request.getFimPeriodoAquisitivo(),
                                request.getInicioGozo(),
                                request.getFimGozo(),
                                request.getObservacao());
        }

        private FeriasResponse criarSolicitacao(
                        Funcionario funcionario,
                        LocalDate inicioPeriodoAquisitivo,
                        LocalDate fimPeriodoAquisitivo,
                        LocalDate inicioGozo,
                        LocalDate fimGozo,
                        String observacao) {
                if (!funcionario.isAtivo()) {
                        throw new BusinessException(
                                        "Não é possível solicitar férias para funcionário inativo.");
                }

                if (funcionario.getStatus() == StatusFuncionario.DESLIGADO) {
                        throw new BusinessException(
                                        "Não é possível solicitar férias para funcionário desligado.");
                }

                if (fimPeriodoAquisitivo.isBefore(
                                inicioPeriodoAquisitivo)) {
                        throw new BusinessException(
                                        "O fim do período aquisitivo não pode ser anterior ao início.");
                }

                if (fimGozo.isBefore(inicioGozo)) {
                        throw new BusinessException(
                                        "O fim das férias não pode ser anterior ao início.");
                }

                long quantidadeDias = ChronoUnit.DAYS.between(
                                inicioGozo,
                                fimGozo) + 1;

                if (quantidadeDias > 30) {
                        throw new BusinessException(
                                        "O período de férias não pode ultrapassar 30 dias.");
                }

                if (quantidadeDias < 1) {
                        throw new BusinessException(
                                        "O período de férias deve possuir pelo menos 1 dia.");
                }

                boolean existeSobreposicao = feriasRepository.existsPeriodoSobreposto(
                                funcionario.getId(),
                                inicioGozo,
                                fimGozo,
                                List.of(
                                                StatusFerias.SOLICITADA,
                                                StatusFerias.APROVADA,
                                                StatusFerias.EM_GOZO));

                if (existeSobreposicao) {
                        throw new BusinessException(
                                        "Já existe uma solicitação de férias para este funcionário nesse período.");
                }

                Ferias ferias = new Ferias();

                ferias.setFuncionario(funcionario);
                ferias.setInicioPeriodoAquisitivo(
                                inicioPeriodoAquisitivo);
                ferias.setFimPeriodoAquisitivo(
                                fimPeriodoAquisitivo);
                ferias.setInicioGozo(inicioGozo);
                ferias.setFimGozo(fimGozo);

                ferias.setQuantidadeDias(
                                Math.toIntExact(quantidadeDias));

                ferias.setStatus(
                                StatusFerias.SOLICITADA);

                ferias.setObservacao(observacao);

                return toResponse(
                                feriasRepository.save(ferias));
        }

        @Transactional(readOnly = true)
        public List<FeriasResponse> listarTodos() {

                return feriasRepository.findAll()
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public FeriasResponse buscarPorId(UUID id) {
                return toResponse(buscarFerias(id));
        }

        @Transactional(readOnly = true)
        public List<FeriasResponse> listarPorFuncionario(
                        UUID funcionarioId) {

                if (!funcionarioRepository.existsById(funcionarioId)) {
                        throw new ResourceNotFoundException(
                                        "Funcionário não encontrado.");
                }

                return feriasRepository
                                .findByFuncionarioIdOrderByInicioGozoDesc(
                                                funcionarioId)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Transactional
        public FeriasResponse aprovar(UUID id) {
                Ferias ferias = buscarFerias(id);

                if (ferias.getStatus() != StatusFerias.SOLICITADA) {
                        throw new BusinessException(
                                        "Somente solicitações pendentes podem ser aprovadas.");
                }

                ferias.setStatus(
                                StatusFerias.APROVADA);

                return toResponse(
                                feriasRepository.save(ferias));
        }

        @Transactional
        public FeriasResponse rejeitar(UUID id) {
                Ferias ferias = buscarFerias(id);

                if (ferias.getStatus() != StatusFerias.SOLICITADA) {
                        throw new BusinessException(
                                        "Somente solicitações pendentes podem ser rejeitadas.");
                }

                ferias.setStatus(
                                StatusFerias.REJEITADA);

                return toResponse(
                                feriasRepository.save(ferias));
        }

        @Transactional
        public FeriasResponse iniciar(UUID id) {
                Ferias ferias = buscarFerias(id);

                validarStatus(
                                ferias,
                                StatusFerias.APROVADA,
                                "Somente férias aprovadas podem ser iniciadas.");

                LocalDate hoje = LocalDate.now();

                if (hoje.isBefore(ferias.getInicioGozo())) {
                        throw new BusinessException(
                                        "As férias só podem ser iniciadas a partir de "
                                                        + ferias.getInicioGozo() + ".");
                }

                Funcionario funcionario = ferias.getFuncionario();

                if (!funcionario.isAtivo()) {
                        throw new BusinessException(
                                        "Não é possível iniciar férias de um funcionário inativo.");
                }

                if (funcionario.getStatus() == StatusFuncionario.DESLIGADO) {
                        throw new BusinessException(
                                        "Não é possível iniciar férias de um funcionário desligado.");
                }

                ferias.setStatus(StatusFerias.EM_GOZO);
                funcionario.setStatus(StatusFuncionario.FERIAS);

                funcionarioRepository.save(funcionario);

                return toResponse(
                                feriasRepository.save(ferias));
        }

        @Transactional
        public FeriasResponse concluir(UUID id) {
                Ferias ferias = buscarFerias(id);

                validarStatus(
                                ferias,
                                StatusFerias.EM_GOZO,
                                "Somente férias em gozo podem ser concluídas.");

                LocalDate hoje = LocalDate.now();

                if (hoje.isBefore(ferias.getFimGozo())) {
                        throw new BusinessException(
                                        "As férias só podem ser concluídas a partir de "
                                                        + ferias.getFimGozo() + ".");
                }

                Funcionario funcionario = ferias.getFuncionario();

                ferias.setStatus(StatusFerias.CONCLUIDA);

                if (funcionario.isAtivo()
                                && funcionario.getStatus() == StatusFuncionario.FERIAS) {
                        funcionario.setStatus(StatusFuncionario.ATIVO);
                        funcionarioRepository.save(funcionario);
                }

                return toResponse(
                                feriasRepository.save(ferias));
        }

        @Transactional
        public FeriasResponse cancelar(UUID id) {
                Ferias ferias = buscarFerias(id);

                if (ferias.getStatus() != StatusFerias.APROVADA) {
                        throw new BusinessException(
                                        "Somente férias aprovadas podem ser canceladas.");
                }

                ferias.setStatus(
                                StatusFerias.CANCELADA);

                return toResponse(
                                feriasRepository.save(ferias));
        }

        private Ferias buscarFerias(UUID id) {

                return feriasRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Registro de férias não encontrado."));
        }

        private void validarStatus(
                        Ferias ferias,
                        StatusFerias statusEsperado,
                        String mensagem) {

                if (ferias.getStatus() != statusEsperado) {
                        throw new BusinessException(mensagem);
                }
        }

        private FeriasResponse toResponse(Ferias ferias) {

                return new FeriasResponse(
                                ferias.getId(),
                                ferias.getFuncionario().getId(),
                                ferias.getFuncionario().getNome(),
                                ferias.getInicioPeriodoAquisitivo(),
                                ferias.getFimPeriodoAquisitivo(),
                                ferias.getInicioGozo(),
                                ferias.getFimGozo(),
                                ferias.getQuantidadeDias(),
                                ferias.getStatus(),
                                ferias.getObservacao(),
                                ferias.getCreatedAt(),
                                ferias.getUpdatedAt());
        }

        private Funcionario buscarFuncionarioDoUsuario(
                        UUID usuarioId) {
                Usuario usuario = usuarioRepository
                                .findById(usuarioId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Usuário não encontrado."));

                if (usuario.getFuncionario() == null) {
                        throw new BusinessException(
                                        "O usuário autenticado não está vinculado a um funcionário.");
                }

                return usuario.getFuncionario();
        }

        public FeriasResponse solicitarMinhasFerias(
                        UUID usuarioId,
                        MinhasFeriasRequest request) {
                Funcionario funcionario = buscarFuncionarioDoUsuario(usuarioId);

                return criarSolicitacao(
                                funcionario,
                                request.getInicioPeriodoAquisitivo(),
                                request.getFimPeriodoAquisitivo(),
                                request.getInicioGozo(),
                                request.getFimGozo(),
                                request.getObservacao());
        }

        @Transactional(readOnly = true)
        public List<FeriasResponse> listarMinhasFerias(
                        UUID usuarioId) {
                Funcionario funcionario = buscarFuncionarioDoUsuario(usuarioId);

                return feriasRepository
                                .findByFuncionarioIdOrderByInicioGozoDesc(
                                                funcionario.getId())
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }
}