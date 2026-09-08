package rhflow.backend.service;

import org.springframework.stereotype.Service;
import rhflow.backend.dto.EnderecoRequest;
import rhflow.backend.dto.EnderecoResponse;
import rhflow.backend.entity.postgresql.Endereco;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.EnderecoRepository;
import rhflow.backend.repository.postgresql.FuncionarioRepository;

import java.util.UUID;

@Service
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final FuncionarioRepository funcionarioRepository;

    public EnderecoService(
            EnderecoRepository enderecoRepository,
            FuncionarioRepository funcionarioRepository
    ) {
        this.enderecoRepository = enderecoRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    public EnderecoResponse criar(EnderecoRequest request) {

        Funcionario funcionario = buscarFuncionario(
                request.getFuncionarioId()
        );

        if (enderecoRepository.existsByFuncionarioId(funcionario.getId())) {
            throw new BusinessException(
                    "Este funcionário já possui um endereço cadastrado."
            );
        }

        Endereco endereco = new Endereco();

        endereco.setFuncionario(funcionario);
        aplicarDados(endereco, request);

        return toResponse(
                enderecoRepository.save(endereco)
        );
    }

    public EnderecoResponse buscarPorFuncionario(UUID funcionarioId) {

        buscarFuncionario(funcionarioId);

        Endereco endereco = enderecoRepository
                .findByFuncionarioId(funcionarioId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Endereço não encontrado."
                        )
                );

        return toResponse(endereco);
    }

    public EnderecoResponse atualizar(
            UUID id,
            EnderecoRequest request
    ) {

        Endereco endereco = buscarEndereco(id);

        if (!endereco.getFuncionario().getId()
                .equals(request.getFuncionarioId())) {

            throw new BusinessException(
                    "Não é permitido alterar o funcionário vinculado ao endereço."
            );
        }

        aplicarDados(endereco, request);

        return toResponse(
                enderecoRepository.save(endereco)
        );
    }

    private void aplicarDados(
            Endereco endereco,
            EnderecoRequest request
    ) {

        endereco.setCep(request.getCep());
        endereco.setLogradouro(request.getLogradouro());
        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());
        endereco.setBairro(request.getBairro());
        endereco.setCidade(request.getCidade());

        if (request.getEstado() != null) {
            endereco.setEstado(
                    request.getEstado().toUpperCase()
            );
        }
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

    private Endereco buscarEndereco(UUID id) {

        return enderecoRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Endereço não encontrado."
                        )
                );
    }

    private EnderecoResponse toResponse(Endereco endereco) {

        EnderecoResponse response = new EnderecoResponse();

        response.setId(endereco.getId());

        response.setFuncionarioId(
                endereco.getFuncionario().getId()
        );

        response.setFuncionarioNome(
                endereco.getFuncionario().getNome()
        );

        response.setCep(endereco.getCep());
        response.setLogradouro(endereco.getLogradouro());
        response.setNumero(endereco.getNumero());
        response.setComplemento(endereco.getComplemento());
        response.setBairro(endereco.getBairro());
        response.setCidade(endereco.getCidade());
        response.setEstado(endereco.getEstado());

        response.setCreatedAt(endereco.getCreatedAt());
        response.setUpdatedAt(endereco.getUpdatedAt());

        return response;
    }
}