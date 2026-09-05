package rhflow.backend.service;

import org.springframework.stereotype.Service;
import rhflow.backend.dto.CargoRequest;
import rhflow.backend.dto.CargoResponse;
import rhflow.backend.entity.postgresql.Cargo;
import rhflow.backend.entity.postgresql.Departamento;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.CargoRepository;
import rhflow.backend.repository.postgresql.DepartamentoRepository;

import java.util.List;
import java.util.UUID;

@Service
public class CargoService {

    private final CargoRepository cargoRepository;
    private final DepartamentoRepository departamentoRepository;

    public CargoService(
            CargoRepository cargoRepository,
            DepartamentoRepository departamentoRepository
    ) {
        this.cargoRepository = cargoRepository;
        this.departamentoRepository = departamentoRepository;
    }

    public CargoResponse criar(CargoRequest request) {

        Departamento departamento =
                buscarDepartamento(request.getDepartamentoId());

        if (!departamento.isAtivo()) {
            throw new BusinessException(
                    "Não é possível cadastrar um cargo em um departamento inativo."
            );
        }

        if (cargoRepository.existsByDepartamentoIdAndNomeIgnoreCase(
                departamento.getId(),
                request.getNome()
        )) {
            throw new BusinessException(
                    "Já existe um cargo com esse nome neste departamento."
            );
        }

        Cargo cargo = new Cargo();

        cargo.setDepartamento(departamento);
        cargo.setNome(request.getNome());
        cargo.setDescricao(request.getDescricao());
        cargo.setNivel(request.getNivel());
        cargo.setSalarioBase(request.getSalarioBase());

        return toResponse(
                cargoRepository.save(cargo)
        );
    }

    public List<CargoResponse> listarTodos() {

        return cargoRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CargoResponse buscarPorId(UUID id) {
        return toResponse(buscarCargo(id));
    }

    public List<CargoResponse> listarPorDepartamento(
            UUID departamentoId
    ) {

        buscarDepartamento(departamentoId);

        return cargoRepository
                .findByDepartamentoId(departamentoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void desativar(UUID id) {

        Cargo cargo = buscarCargo(id);

        cargo.setAtivo(false);

        cargoRepository.save(cargo);
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

    private Departamento buscarDepartamento(UUID id) {

        return departamentoRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Departamento não encontrado."
                        )
                );
    }

    private CargoResponse toResponse(Cargo cargo) {

        CargoResponse response = new CargoResponse();

        response.setId(cargo.getId());

        response.setDepartamentoId(
                cargo.getDepartamento().getId()
        );

        response.setDepartamentoNome(
                cargo.getDepartamento().getNome()
        );

        response.setNome(cargo.getNome());
        response.setDescricao(cargo.getDescricao());
        response.setNivel(cargo.getNivel());
        response.setSalarioBase(cargo.getSalarioBase());
        response.setAtivo(cargo.isAtivo());

        response.setCreatedAt(cargo.getCreatedAt());
        response.setUpdatedAt(cargo.getUpdatedAt());

        return response;
    }
}