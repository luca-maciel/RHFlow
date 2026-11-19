package rhflow.backend.service;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import rhflow.backend.dto.DesligamentoFuncionarioRequest;
import rhflow.backend.dto.FuncionarioRequest;
import rhflow.backend.dto.FuncionarioResponse;
import rhflow.backend.dto.ReativacaoFuncionarioRequest;
import rhflow.backend.entity.postgresql.Cargo;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.enums.StatusFuncionario;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.CargoRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Set;

@Service
@Transactional
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final CargoRepository cargoRepository;
    private final ContratoService contratoService;
    private final AuditoriaService auditoriaService;
    
    private static final Path FOTOS_DIR = Paths.get("uploads", "fotos-funcionarios");
    private static final long MAX_FOTO_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    public record FotoArquivo(byte[] bytes, String contentType) {}

    public FuncionarioResponse atualizarFoto(UUID id, MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new BusinessException("Selecione uma imagem válida.");
        }
        if (arquivo.getSize() > MAX_FOTO_BYTES) {
            throw new BusinessException("A foto deve ter no máximo 5 MB.");
        }

        String contentType = arquivo.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException("Formato inválido. Utilize JPEG, PNG ou WEBP.");
        }

        Funcionario funcionario = buscarFuncionario(id);
        String ext = switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };

        try {
            Files.createDirectories(FOTOS_DIR);
            removerArquivoFisico(funcionario.getFotoPath());

            String fileName = id + "_" + System.currentTimeMillis() + ext;
            Path destino = FOTOS_DIR.resolve(fileName).normalize();
            Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            funcionario.setFotoPath(destino.toString());
            Funcionario salvo = funcionarioRepository.save(funcionario);

            auditoriaService.registrar(
                    "ATUALIZAR_FOTO_FUNCIONARIO",
                    "FUNCIONARIO",
                    salvo.getId().toString(),
                    "Foto de perfil do funcionário '" + salvo.getNome() + "' atualizada",
                    Map.of("contentType", contentType, "tamanhoBytes", arquivo.getSize())
            );

            return toResponse(salvo);
        } catch (IOException e) {
            throw new BusinessException("Erro ao armazenar a foto de perfil.");
        }
    }

    @Transactional
    public FotoArquivo buscarFoto(UUID id) {
        Funcionario funcionario = buscarFuncionario(id);
        if (funcionario.getFotoPath() == null || funcionario.getFotoPath().isBlank()) {
            throw new ResourceNotFoundException("Funcionário não possui foto cadastrada.");
        }

        try {
            Path path = Paths.get(funcionario.getFotoPath()).normalize();
            if (!Files.exists(path)) {
                throw new ResourceNotFoundException("Arquivo da foto não encontrado.");
            }
            byte[] bytes = Files.readAllBytes(path);
            String probed = Files.probeContentType(path);
            String contentType = probed != null ? probed : "image/jpeg";
            return new FotoArquivo(bytes, contentType);
        } catch (IOException e) {
            throw new BusinessException("Erro ao ler a foto do funcionário.");
        }
    }

    public FuncionarioResponse removerFoto(UUID id) {
        Funcionario funcionario = buscarFuncionario(id);
        if (funcionario.getFotoPath() != null && !funcionario.getFotoPath().isBlank()) {
            removerArquivoFisico(funcionario.getFotoPath());
            funcionario.setFotoPath(null);
            funcionario = funcionarioRepository.save(funcionario);

            auditoriaService.registrar(
                    "REMOVER_FOTO_FUNCIONARIO",
                    "FUNCIONARIO",
                    funcionario.getId().toString(),
                    "Foto de perfil do funcionário '" + funcionario.getNome() + "' removida",
                    Map.of()
            );
        }
        return toResponse(funcionario);
    }

    private void removerArquivoFisico(String pathStr) {
        if (pathStr == null || pathStr.isBlank()) return;
        try {
            Files.deleteIfExists(Paths.get(pathStr).normalize());
        } catch (IOException ignored) {
        }
    }

    public FuncionarioService(
            FuncionarioRepository funcionarioRepository,
            CargoRepository cargoRepository,
            ContratoService contratoService,
            AuditoriaService auditoriaService) {
        this.funcionarioRepository = funcionarioRepository;
        this.cargoRepository = cargoRepository;
        this.contratoService = contratoService;
        this.auditoriaService = auditoriaService;
    }

    public FuncionarioResponse criar(FuncionarioRequest request) {
        if (request.getStatus() == StatusFuncionario.DESLIGADO) {
            throw new BusinessException("Utilize a operação de desligamento.");
        }

        Cargo cargo = buscarCargo(request.getCargoId());
        validarCargo(cargo);

        if (funcionarioRepository.existsByCpf(request.getCpf())) {
            throw new BusinessException("Já existe um funcionário cadastrado com esse CPF.");
        }

        Funcionario funcionario = new Funcionario();
        funcionario.setCargo(cargo);
        funcionario.setNome(request.getNome());
        funcionario.setCpf(request.getCpf());
        funcionario.setRg(request.getRg());
        funcionario.setDataNascimento(request.getDataNascimento());
        funcionario.setEmail(request.getEmail());
        funcionario.setTelefone(request.getTelefone());
        funcionario.setDataAdmissao(request.getDataAdmissao());

        if (request.getStatus() != null) {
            funcionario.setStatus(request.getStatus());
        }
        funcionario.setAtivo(funcionario.getStatus() != StatusFuncionario.DESLIGADO);

        Funcionario salvo = funcionarioRepository.save(funcionario);

        auditoriaService.registrar(
                "CADASTRAR_FUNCIONARIO",
                "FUNCIONARIO",
                salvo.getId().toString(),
                "Funcionário '" + salvo.getNome() + "' admitido no cargo " + cargo.getNome(),
                Map.of("cargo", cargo.getNome(), "status", salvo.getStatus().name())
        );

        return toResponse(salvo);
    }

    @Transactional
    public List<FuncionarioResponse> listarTodos() {
        return funcionarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FuncionarioResponse buscarPorId(UUID id) {
        return toResponse(buscarFuncionario(id));
    }

    @Transactional
    public List<FuncionarioResponse> listarPorCargo(UUID cargoId) {
        buscarCargo(cargoId);
        return funcionarioRepository.findByCargoId(cargoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<FuncionarioResponse> listarPorDepartamento(UUID departamentoId) {
        return funcionarioRepository.findByCargoDepartamentoId(departamentoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<FuncionarioResponse> listarPorEmpresa(UUID empresaId) {
        return funcionarioRepository.findByCargoDepartamentoEmpresaId(empresaId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FuncionarioResponse desligar(UUID id, DesligamentoFuncionarioRequest request) {
        Funcionario funcionario = buscarFuncionario(id);

        if (funcionario.getStatus() == StatusFuncionario.DESLIGADO) {
            throw new BusinessException("O funcionário já está desligado.");
        }

        if (request.getDataDemissao().isBefore(funcionario.getDataAdmissao())) {
            throw new BusinessException("A data de desligamento não pode ser anterior à data de admissão.");
        }

        funcionario.setDataDemissao(request.getDataDemissao());
        funcionario.setStatus(StatusFuncionario.DESLIGADO);
        funcionario.setAtivo(false);

        Funcionario salvo = funcionarioRepository.save(funcionario);
        contratoService.encerrarContratoAtivoDoFuncionario(
                salvo.getId(),
                request.getDataDemissao()
        );

        auditoriaService.registrar(
                "DESLIGAR_FUNCIONARIO",
                "FUNCIONARIO",
                salvo.getId().toString(),
                "Funcionário '" + salvo.getNome() + "' desligado em " + salvo.getDataDemissao(),
                Map.of("dataDemissao", salvo.getDataDemissao().toString())
        );

        return toResponse(salvo);
    }

    public FuncionarioResponse reativar(UUID id, ReativacaoFuncionarioRequest request) {
        Funcionario funcionario = buscarFuncionario(id);
        if (request.status() != StatusFuncionario.ATIVO) {
            throw new BusinessException("A reativação exige o status ATIVO.");
        }
        if (funcionario.getStatus() != StatusFuncionario.DESLIGADO) {
            throw new BusinessException("Somente funcionários desligados podem ser reativados.");
        }
        validarCargo(funcionario.getCargo());
        funcionario.setStatus(StatusFuncionario.ATIVO);
        funcionario.setAtivo(true);
        funcionario.setDataDemissao(null);

        Funcionario salvo = funcionarioRepository.save(funcionario);

        auditoriaService.registrar(
                "REATIVAR_FUNCIONARIO",
                "FUNCIONARIO",
                salvo.getId().toString(),
                "Funcionário '" + salvo.getNome() + "' reativado",
                Map.of("status", salvo.getStatus().name())
        );

        return toResponse(salvo);
    }

    private void validarCargo(Cargo cargo) {
        if (!cargo.isAtivo()) {
            throw new BusinessException("Não é possível vincular o funcionário a um cargo inativo.");
        }
        if (!cargo.getDepartamento().isAtivo()) {
            throw new BusinessException("O departamento deste cargo está inativo.");
        }
        if (!cargo.getDepartamento().getEmpresa().isAtivo()) {
            throw new BusinessException("A empresa deste cargo está inativa.");
        }
    }

    @Transactional
    private Cargo buscarCargo(UUID id) {
        return cargoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo não encontrado."));
    }

    @Transactional
    private Funcionario buscarFuncionario(UUID id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado."));
    }

    private FuncionarioResponse toResponse(Funcionario funcionario) {
        FuncionarioResponse response = new FuncionarioResponse();
        response.setId(funcionario.getId());
        response.setCargoId(funcionario.getCargo().getId());
        response.setCargoNome(funcionario.getCargo().getNome());
        response.setDepartamentoId(funcionario.getCargo().getDepartamento().getId());
        response.setDepartamentoNome(funcionario.getCargo().getDepartamento().getNome());
        response.setEmpresaId(funcionario.getCargo().getDepartamento().getEmpresa().getId());
        response.setEmpresaNome(funcionario.getCargo().getDepartamento().getEmpresa().getNome());
        response.setNome(funcionario.getNome());
        response.setCpf(funcionario.getCpf());
        response.setRg(funcionario.getRg());
        response.setDataNascimento(funcionario.getDataNascimento());
        response.setEmail(funcionario.getEmail());
        response.setTelefone(funcionario.getTelefone());
        response.setDataAdmissao(funcionario.getDataAdmissao());
        response.setDataDemissao(funcionario.getDataDemissao());
        response.setStatus(funcionario.getStatus());
        response.setAtivo(funcionario.isAtivo());
        response.setCreatedAt(funcionario.getCreatedAt());
        response.setUpdatedAt(funcionario.getUpdatedAt());

        response.setPossuiFoto(
                funcionario.getFotoPath() != null && !funcionario.getFotoPath().isBlank()
        );

        return response;
    }

    public FuncionarioResponse atualizar(UUID id, FuncionarioRequest request) {
        Funcionario funcionario = buscarFuncionario(id);
        StatusFuncionario status = request.getStatus() != null
                ? request.getStatus() : funcionario.getStatus();
        if (status != funcionario.getStatus()
                && (status == StatusFuncionario.DESLIGADO
                    || funcionario.getStatus() == StatusFuncionario.DESLIGADO)) {
            throw new BusinessException("Utilize a operação específica de desligamento ou reativação.");
        }
        if (funcionario.getDataDemissao() != null
                && request.getDataAdmissao().isAfter(funcionario.getDataDemissao())) {
            throw new BusinessException("A data de admissão não pode ser posterior à data de desligamento.");
        }

        Cargo cargo = buscarCargo(request.getCargoId());
        validarCargo(cargo);

        if (funcionarioRepository.existsByCpfAndIdNot(request.getCpf(), id)) {
            throw new BusinessException("Já existe um funcionário cadastrado com esse CPF.");
        }

        funcionario.setCargo(cargo);
        funcionario.setNome(request.getNome());
        funcionario.setCpf(request.getCpf());
        funcionario.setRg(request.getRg());
        funcionario.setDataNascimento(request.getDataNascimento());
        funcionario.setEmail(request.getEmail());
        funcionario.setTelefone(request.getTelefone());
        funcionario.setDataAdmissao(request.getDataAdmissao());

        if (request.getStatus() != null) {
            funcionario.setStatus(request.getStatus());
        }
        funcionario.setAtivo(funcionario.getStatus() != StatusFuncionario.DESLIGADO);

        Funcionario salvo = funcionarioRepository.save(funcionario);

        auditoriaService.registrar(
                "ATUALIZAR_FUNCIONARIO",
                "FUNCIONARIO",
                salvo.getId().toString(),
                "Dados cadastrais do funcionário '" + salvo.getNome() + "' atualizados",
                Map.of("cargo", cargo.getNome(), "status", salvo.getStatus().name())
        );

        return toResponse(salvo);
    }

    @Transactional
    public long contarPorStatus(StatusFuncionario status) {
        return funcionarioRepository.countByFuncionarioStatus(status.name());
    }
}