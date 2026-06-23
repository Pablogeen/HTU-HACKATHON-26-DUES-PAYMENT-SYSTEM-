package com.boyboys.dues_payment_system;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfiguration {

        @Configuration
        public class ModelMapperConfig {

            @Bean
            public ModelMapper modelMapper() {
                ModelMapper modelMapper = new ModelMapper();
                modelMapper.getConfiguration()
                        .setMatchingStrategy(MatchingStrategies.STRICT)
                        .setSkipNullEnabled(true)
                        .setFieldMatchingEnabled(true);
                return modelMapper;
            }
        }

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            builder.modules(new JavaTimeModule());
            builder.featuresToDisable(
                    SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        };
    }

//    @Bean
//    public OpenAPI customOpenAPI() {
//
//        final String securitySchemeName = "bearerAuth";
//
//        return new OpenAPI()
//                .info(new Info()
//                        .title("My Portfolio API")
//                        .version("1.0")
//                        .description("Documentation for My Portfolio backend APIs")
//                        .contact(new Contact()
//                                .name("BEN & CO")
//                                .email("tettehbernard283@gmail.com"))
//                        .license(new License()
//                                .name("Apache 2.0")))
//
//                .addSecurityItem(
//                        new SecurityRequirement()
//                                .addList(securitySchemeName)
//                )
//
//                .schemaRequirement(
//                        securitySchemeName,
//                        new SecurityScheme()
//                                .name(securitySchemeName)
//                                .type(SecurityScheme.Type.HTTP)
//                                .scheme("bearer")
//                                .bearerFormat("JWT")
//                );
 //   }
}
