package rhflow.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String from;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String from) {
        this.mailSender = mailSender;
        this.from = "RHFlow <" + from + ">";
    }

    @Async
    public void enviarCodigoRecuperacao(String destinatario, String nomeUsuario, String codigo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(destinatario);
        message.setSubject("RHFlow - Código de recuperação de senha");
        message.setText("""
                Olá, %s!

                Recebemos uma solicitação para redefinir a senha da sua conta no RHFlow.

                Seu código de verificação é: %s

                Este código expira em 15 minutos e pode ser utilizado apenas uma vez.
                Se você não solicitou esta alteração, ignore este e-mail.

                Atenciosamente,
                Equipe RHFlow
                """.formatted(nomeUsuario, codigo));

        mailSender.send(message);
    }
}