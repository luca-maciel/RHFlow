package rhflow.backend.service;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import rhflow.backend.dto.CargoRequest;
import rhflow.backend.dto.CargoResponse;
import rhflow.backend.entity.postgresql.Cargo;
import rhflow.backend.entity.postgresql.Departamento;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.CargoRepository;
import rhflow.backend.repository.postgresql.DepartamentoRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class CargoService {

    private final CargoRepository cargoRepository;
    private final DepartamentoRepository departamentoRepository;
    private final AuditoriaService auditoriaService;

    public CargoService(
            CargoRepository cargoRepository,
            DepartamentoRepository departamentoRepository,
            AuditoriaService auditoriaService) {
        this.cargoRepository = cargoRepository;
        this.departamentoRepository = departamentoRepository;
        this.auditoriaService = auditoriaService;
    }

    public CargoResponse criar(CargoRequest request) {
        Departamento departamento = buscarDepartamento(request.getDepartamentoId());

        if (!departamento.isAtivo()) {
            throw new BusinessException("Não é possível cadastrar um cargo em um departamento inativo.");
        }

        if (cargoRepository.existsByDepartamentoIdAndNomeIgnoreCase(departamento.getId(), request.getNome())) {
            throw new BusinessException("Já existe um cargo com esse nome neste departamento.");
        }

        Cargo cargo = new Cargo();
        cargo.setDepartamento(departamento);
        cargo.setNome(request.getNome());
        cargo.setDescricao(request.getDescricao());
        cargo.setNivel(request.getNivel());
        cargo.setSalarioBase(request.getSalarioBase());

        Cargo salvo = cargoRepository.save(cargo);

        auditoriaService.registrar(
                "CADASTRAR_CARGO",
                "CARGO",
                salvo.getId().toString(),
                "Cargo '" + salvo.getNome() + "' cadastrado no departamento " + departamento.getNome(),
                Map.of("departamentoId", departamento.getId().toString())
        );

        return toResponse(salvo);
    }

    @Transactional
    public List<CargoResponse> listarTodos() {
        return cargoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public CargoResponse buscarPorId(UUID id) {
        return toResponse(buscarCargo(id));
    }

    @Transactional
    public List<CargoResponse> listarPorDepartamento(UUID departamentoId) {
        buscarDepartamento(departamentoId);
        return cargoRepository.findByDepartamentoId(departamentoId).stream().map(this::toResponse).toList();
    }

    public void desativar(UUID id) {
        Cargo cargo = buscarCargo(id);
        cargo.setAtivo(false);
        cargoRepository.save(cargo);

        auditoriaService.registrar(
                "DESATIVAR_CARGO",
                "CARGO",
                cargo.getId().toString(),
                "Cargo '" + cargo.getNome() + "' desativado",
                Map.of("departamentoId", cargo.getDepartamento().getId().toString())
        );
    }

    @Transactional
    private Cargo buscarCargo(UUID id) {
        return cargoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo não encontrado."));
    }

    @Transactional
    private Departamento buscarDepartamento(UUID id) {
        return departamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado."));
    }

    private CargoResponse toResponse(Cargo cargo) {
        CargoResponse response = new CargoResponse();
        response.setId(cargo.getId());
        response.setDepartamentoId(cargo.getDepartamento().getId());
        response.setDepartamentoNome(cargo.getDepartamento().getNome());
        response.setNome(cargo.getNome());
        response.setDescricao(cargo.getDescricao());
        response.setNivel(cargo.getNivel());
        response.setSalarioBase(cargo.getSalarioBase());
        response.setAtivo(cargo.isAtivo());
        response.setCreatedAt(cargo.getCreatedAt());
        response.setUpdatedAt(cargo.getUpdatedAt());
        return response;
    }

    public CargoResponse atualizar(UUID id, CargoRequest request) {
        Cargo cargo = buscarCargo(id);
        Departamento departamento = buscarDepartamento(request.getDepartamentoId());

        if (!departamento.isAtivo()) {
            throw new BusinessException("Não é possível vincular o cargo a um departamento inativo.");
        }

        boolean nomeJaExiste = cargoRepository
                .existsByDepartamentoIdAndNomeIgnoreCase(departamento.getId(), request.getNome());

        boolean mesmoCargo = cargo.getDepartamento().getId().equals(departamento.getId())
                && cargo.getNome().equalsIgnoreCase(request.getNome());

        if (nomeJaExiste && !mesmoCargo) {
            throw new BusinessException("Já existe um cargo com esse nome neste departamento.");
        }

        cargo.setDepartamento(departamento);
        cargo.setNome(request.getNome());
        cargo.setDescricao(request.getDescricao());
        cargo.setNivel(request.getNivel());
        cargo.setSalarioBase(request.getSalarioBase());

        Cargo salvo = cargoRepository.save(cargo);

        auditoriaService.registrar(
                "ATUALIZAR_CARGO",
                "CARGO",
                salvo.getId().toString(),
                "Cargo '" + salvo.getNome() + "' atualizado",
                Map.of("departamentoId", departamento.getId().toString())
        );

        return toResponse(salvo);
    }
}