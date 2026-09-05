package rhflow.backend.service;

import org.springframework.stereotype.Service;
import rhflow.backend.dto.EmpresaRequest;
import rhflow.backend.dto.EmpresaResponse;
import rhflow.backend.entity.postgresql.Empresa;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.EmpresaRepository;

import java.util.List;
import java.util.UUID;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaService(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    public EmpresaResponse criar(EmpresaRequest request) {

        if (empresaRepository.existsByCnpj(request.getCnpj())) {
            throw new BusinessException(
                    "Já existe uma empresa cadastrada com esse CNPJ.");
        }

        Empresa empresa = new Empresa();

        empresa.setRazaoSocial(request.getRazaoSocial());
        empresa.setNome(request.getNome());
        empresa.setCnpj(request.getCnpj());
        empresa.setEmail(request.getEmail());
        empresa.setTelefone(request.getTelefone());

        Empresa empresaSalva = empresaRepository.save(empresa);

        return toResponse(empresaSalva);
    }

    public List<EmpresaResponse> listarTodas() {
        return empresaRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EmpresaResponse buscarPorId(UUID id) {

        Empresa empresa = empresaRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada."));

        return toResponse(empresa);
    }

    public EmpresaResponse atualizar(UUID id, EmpresaRequest request) {

        Empresa empresa = empresaRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada."));

        boolean cnpjPertenceOutraEmpresa = !empresa.getCnpj().equals(request.getCnpj())
                && empresaRepository.existsByCnpj(request.getCnpj());

        if (cnpjPertenceOutraEmpresa) {
            throw new BusinessException(
                    "Já existe uma empresa cadastrada com esse CNPJ.");
        }

        empresa.setRazaoSocial(request.getRazaoSocial());
        empresa.setNome(request.getNome());
        empresa.setCnpj(request.getCnpj());
        empresa.setEmail(request.getEmail());
        empresa.setTelefone(request.getTelefone());

        return toResponse(empresaRepository.save(empresa));
    }

    public void desativar(UUID id) {

        Empresa empresa = empresaRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada."));

        empresa.setAtivo(false);

        empresaRepository.save(empresa);
    }

    private EmpresaResponse toResponse(Empresa empresa) {

        EmpresaResponse response = new EmpresaResponse();

        response.setId(empresa.getId());
        response.setRazaoSocial(empresa.getRazaoSocial());
        response.setNome(empresa.getNome());
        response.setCnpj(empresa.getCnpj());
        response.setEmail(empresa.getEmail());
        response.setTelefone(empresa.getTelefone());
        response.setAtivo(empresa.isAtivo());
        response.setCreatedAt(empresa.getCreatedAt());
        response.setUpdatedAt(empresa.getUpdatedAt());

        return response;
    }
}