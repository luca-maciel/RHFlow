package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Perfil;

import java.util.Optional;
import java.util.UUID;

public interface PerfilRepository
        extends JpaRepository<Perfil, UUID> {

    Optional<Perfil> findByNome(String nome);

    boolean existsByNome(String nome);
}