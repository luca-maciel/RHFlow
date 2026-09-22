package rhflow.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry
                    .addMapping("/**")
                    .allowedOrigins(
                        "http://localhost:5173",
                        "http://192.168.137.37:5173",
                        "http://192.168.137.1:5173",
                        "http://192.168.141.89:5173",
                        "http://192.168.137.80:5173"
                    )
                    .allowedMethods(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                    )
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}