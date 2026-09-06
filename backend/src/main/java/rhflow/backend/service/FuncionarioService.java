package rhflow.backend.service;

import org.springframework.stereotype.Service;
import rhflow.backend.dto.DesligamentoFuncionarioRequest;
import rhflow.backend.dto.FuncionarioRequest;
import rhflow.backend.dto.FuncionarioResponse;
import rhflow.backend.entity.postgresql.Cargo;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.enums.StatusFuncionario;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.CargoRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;

import java.util.List;
import java.util.UUID;

@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final CargoRepository cargoRepository;

    public FuncionarioService(
            FuncionarioRepository funcionarioRepository,
            CargoRepository cargoRepository
    ) {
        this.funcionarioRepository = funcionarioRepository;
        this.cargoRepository = cargoRepository;
    }

    public FuncionarioResponse criar(FuncionarioRequest request) {

        Cargo cargo = buscarCargo(request.getCargoId());

        validarCargo(cargo);

        if (funcionarioRepository.existsByCpf(request.getCpf())) {
            throw new BusinessException(
                    "Já existe um funcionário cadastrado com esse CPF."
            );
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

        return toResponse(
                funcionarioRepository.save(funcionario)
        );
    }

    public List<FuncionarioResponse> listarTodos() {

        return funcionarioRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FuncionarioResponse buscarPorId(UUID id) {
        return toResponse(buscarFuncionario(id));
    }

    public List<FuncionarioResponse> listarPorCargo(UUID cargoId) {

        buscarCargo(cargoId);

        return funcionarioRepository
                .findByCargoId(cargoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<FuncionarioResponse> listarPorDepartamento(
            UUID departamentoId
    ) {

        return funcionarioRepository
                .findByCargoDepartamentoId(departamentoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<FuncionarioResponse> listarPorEmpresa(
            UUID empresaId
    ) {

        return funcionarioRepository
                .findByCargoDepartamentoEmpresaId(empresaId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FuncionarioResponse desligar(
            UUID id,
            DesligamentoFuncionarioRequest request
    ) {

        Funcionario funcionario = buscarFuncionario(id);

        if (funcionario.getStatus() == StatusFuncionario.DESLIGADO) {
            throw new BusinessException(
                    "O funcionário já está desligado."
            );
        }

        if (
            request.getDataDemissao()
                    .isBefore(funcionario.getDataAdmissao())
        ) {
            throw new BusinessException(
                    "A data de desligamento não pode ser anterior à data de admissão."
            );
        }

        funcionario.setDataDemissao(request.getDataDemissao());
        funcionario.setStatus(StatusFuncionario.DESLIGADO);
        funcionario.setAtivo(false);

        return toResponse(
                funcionarioRepository.save(funcionario)
        );
    }

    private void validarCargo(Cargo cargo) {

        if (!cargo.isAtivo()) {
            throw new BusinessException(
                    "Não é possível vincular o funcionário a um cargo inativo."
            );
        }

        if (!cargo.getDepartamento().isAtivo()) {
            throw new BusinessException(
                    "O departamento deste cargo está inativo."
            );
        }

        if (!cargo.getDepartamento().getEmpresa().isAtivo()) {
            throw new BusinessException(
                    "A empresa deste cargo está inativa."
            );
        }
    }

    private Cargo buscarCargo(UUID id) {

        return cargoRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cargo não encontrado."
                        )
                );
    }

    private Funcionario buscarFuncionario(UUID id) {

        return funcionarioRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Funcionário não encontrado."
                        )
                );
    }

    private FuncionarioResponse toResponse(
            Funcionario funcionario
    ) {

        FuncionarioResponse response =
                new FuncionarioResponse();

        response.setId(funcionario.getId());

        response.setCargoId(
                funcionario.getCargo().getId()
        );

        response.setCargoNome(
                funcionario.getCargo().getNome()
        );

        response.setDepartamentoId(
                funcionario
                        .getCargo()
                        .getDepartamento()
                        .getId()
        );

        response.setDepartamentoNome(
                funcionario
                        .getCargo()
                        .getDepartamento()
                        .getNome()
        );

        response.setEmpresaId(
                funcionario
                        .getCargo()
                        .getDepartamento()
                        .getEmpresa()
                        .getId()
        );

        response.setEmpresaNome(
                funcionario
                        .getCargo()
                        .getDepartamento()
                        .getEmpresa()
                        .getNome()
        );

        response.setNome(funcionario.getNome());
        response.setCpf(funcionario.getCpf());
        response.setRg(funcionario.getRg());

        response.setDataNascimento(
                funcionario.getDataNascimento()
        );

        response.setEmail(funcionario.getEmail());
        response.setTelefone(funcionario.getTelefone());

        response.setDataAdmissao(
                funcionario.getDataAdmissao()
        );

        response.setDataDemissao(
                funcionario.getDataDemissao()
        );

        response.setStatus(funcionario.getStatus());
        response.setAtivo(funcionario.isAtivo());

        response.setCreatedAt(funcionario.getCreatedAt());
        response.setUpdatedAt(funcionario.getUpdatedAt());

        return response;
    }
}