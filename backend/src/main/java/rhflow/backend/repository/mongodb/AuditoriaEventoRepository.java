package rhflow.backend.repository.mongodb;

import org.springframework.data.mongodb.repository.MongoRepository;
import rhflow.backend.entity.mongodb.AuditoriaEvento;

import java.util.List;

public interface AuditoriaEventoRepository extends MongoRepository<AuditoriaEvento, String> {

    List<AuditoriaEvento> findTop200ByOrderByDataHoraDesc();

    List<AuditoriaEvento> findByEntidadeOrderByDataHoraDesc(String entidade);
}