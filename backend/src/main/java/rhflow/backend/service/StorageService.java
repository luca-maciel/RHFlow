package rhflow.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import rhflow.backend.exception.BusinessException;
import rhflow.backend.exception.ResourceNotFoundException;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class StorageService {

    private static final Set<String> CONTENT_TYPES_PERMITIDOS = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final Path rootLocation;

    public StorageService(@Value("${app.storage.documents-dir:uploads/documentos}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível inicializar o diretório de armazenamento de documentos.", e);
        }
    }

    public String armazenar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Selecione um arquivo válido para envio.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !CONTENT_TYPES_PERMITIDOS.contains(contentType)) {
            throw new BusinessException("Formato não permitido. Envie apenas PDF, PNG, JPG ou DOCX.");
        }

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "arquivo"
        );
        String extensao = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extensao = originalName.substring(dotIndex);
        }

        String nomeArmazenado = UUID.randomUUID() + extensao;

        try {
            Path destino = this.rootLocation.resolve(nomeArmazenado).normalize();
            if (!destino.startsWith(this.rootLocation)) {
                throw new BusinessException("Caminho de arquivo inválido.");
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destino, StandardCopyOption.REPLACE_EXISTING);
            }
            return nomeArmazenado;
        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar o arquivo no servidor.", e);
        }
    }

    public Resource carregarComoResource(String nomeArmazenado) {
        try {
            Path arquivo = this.rootLocation.resolve(nomeArmazenado).normalize();
            Resource resource = new UrlResource(arquivo.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new ResourceNotFoundException("Arquivo físico não encontrado no servidor.");
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Caminho de arquivo inválido.");
        }
    }
}