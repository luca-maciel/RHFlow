package rhflow.backend.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import rhflow.backend.service.FeriasService;

@Component
public class FeriasScheduler {

    private static final Logger log = LoggerFactory.getLogger(FeriasScheduler.class);

    private final FeriasService feriasService;

    public FeriasScheduler(FeriasService feriasService) {
        this.feriasService = feriasService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void executarAoIniciar() {
        log.info("Executando sincronização automática de férias na inicialização...");
        feriasService.processarTransicoesAutomaticas();
    }

    @Scheduled(cron = "0 5 0 * * *")
    public void executarDiariamente() {
        log.info("Executando rotina diária de sincronização de férias...");
        feriasService.processarTransicoesAutomaticas();
    }
}