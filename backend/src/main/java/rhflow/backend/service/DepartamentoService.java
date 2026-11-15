package rhflow.backend.service;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import rhflow.backend.dto.DepartamentoRequest;
import rhflow.backend.dto.DepartamentoResponse;
import rhflow.backend.entity.postgresql.Departamento;
import rhflow.backend.entity.postgresql.Empresa;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.DepartamentoRepository;
import rhflow.backend.repository.postgresql.EmpresaRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class DepartamentoService {

    private final DepartamentoRepository departamentoRepository;
    private final EmpresaRepository empresaRepository;
    private final AuditoriaService auditoriaService;

    public DepartamentoService(
            DepartamentoRepository departamentoRepository,
            EmpresaRepository empresaRepository,
            AuditoriaService auditoriaService) {
        this.departamentoRepository = departamentoRepository;
        this.empresaRepository = empresaRepository;
        this.auditoriaService = auditoriaService;
    }

    public DepartamentoResponse criar(DepartamentoRequest request) {
        Empresa empresa = buscarEmpresa(request.getEmpresaId());

        if (!empresa.isAtivo()) {
            throw new BusinessException("Não é possível cadastrar um departamento em uma empresa inativa.");
        }

        if (departamentoRepository.existsByEmpresaIdAndNomeIgnoreCase(empresa.getId(), request.getNome())) {
            throw new BusinessException("Já existe um departamento com esse nome nesta empresa.");
        }

        Departamento departamento = new Departamento();
        departamento.setEmpresa(empresa);
        departamento.setNome(request.getNome());
        departamento.setDescricao(request.getDescricao());

        Departamento salvo = departamentoRepository.save(departamento);

        auditoriaService.registrar(
                "CADASTRAR_DEPARTAMENTO",
                "DEPARTAMENTO",
                salvo.getId().toString(),
                "Departamento '" + salvo.getNome() + "' cadastrado na empresa " + empresa.getNome(),
                Map.of("empresaId", empresa.getId().toString())
        );

        return toResponse(salvo);
    }

    @Transactional
    public List<DepartamentoResponse> listarTodos() {
        return departamentoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<DepartamentoResponse> listarPorEmpresa(UUID empresaId) {
        buscarEmpresa(empresaId);
        return departamentoRepository.findByEmpresaId(empresaId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public DepartamentoResponse buscarPorId(UUID id) {
        return toResponse(buscarDepartamento(id));
    }

    @Transactional
    public void desativar(UUID id) {
        Departamento departamento = buscarDepartamento(id);
        departamento.setAtivo(false);
        departamentoRepository.save(departamento);

        auditoriaService.registrar(
                "DESATIVAR_DEPARTAMENTO",
                "DEPARTAMENTO",
                departamento.getId().toString(),
                "Departamento '" + departamento.getNome() + "' desativado",
                Map.of("empresaId", departamento.getEmpresa().getId().toString())
        );
    }

    private Empresa buscarEmpresa(UUID id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada."));
    }

    private Departamento buscarDepartamento(UUID id) {
        return departamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado."));
    }

    public DepartamentoResponse atualizar(UUID id, DepartamentoRequest request) {
        Departamento departamento = buscarDepartamento(id);
        Empresa empresa = buscarEmpresa(request.getEmpresaId());

        if (!empresa.isAtivo()) {
            throw new BusinessException("Não é possível vincular o departamento a uma empresa inativa.");
        }

        boolean nomeJaExiste = departamentoRepository
                .existsByEmpresaIdAndNomeIgnoreCase(empresa.getId(), request.getNome());

        boolean mesmoNome = departamento.getEmpresa().getId().equals(empresa.getId())
                && departamento.getNome().equalsIgnoreCase(request.getNome());

        if (nomeJaExiste && !mesmoNome) {
            throw new BusinessException("Já existe um departamento com esse nome nesta empresa.");
        }

        departamento.setEmpresa(empresa);
        departamento.setNome(request.getNome());
        departamento.setDescricao(request.getDescricao());

        Departamento salvo = departamentoRepository.save(departamento);

        auditoriaService.registrar(
                "ATUALIZAR_DEPARTAMENTO",
                "DEPARTAMENTO",
                salvo.getId().toString(),
                "Departamento '" + salvo.getNome() + "' atualizado",
                Map.of("empresaId", empresa.getId().toString())
        );

        return toResponse(salvo);
    }

    private DepartamentoResponse toResponse(Departamento departamento) {
        DepartamentoResponse response = new DepartamentoResponse();
        response.setId(departamento.getId());
        response.setEmpresaId(departamento.getEmpresa().getId());
        response.setEmpresaNome(departamento.getEmpresa().getNome());
        response.setNome(departamento.getNome());
        response.setDescricao(departamento.getDescricao());
        response.setAtivo(departamento.isAtivo());
        response.setCreatedAt(departamento.getCreatedAt());
        response.setUpdatedAt(departamento.getUpdatedAt());
        return response;
    }
}