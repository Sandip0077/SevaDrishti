package com.sevadrishti.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig {
    @Value("${mongodb.connect-timeout-ms:5000}")
    private int connectTimeoutMs;

    @Value("${mongodb.read-timeout-ms:10000}")
    private int readTimeoutMs;

    @Value("${mongodb.server-selection-timeout-ms:10000}")
    private int serverSelectionTimeoutMs;

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoTimeoutCustomizer() {
        return builder -> builder
                .applyToClusterSettings(settings -> settings
                        .serverSelectionTimeout(serverSelectionTimeoutMs, TimeUnit.MILLISECONDS))
                .applyToSocketSettings(settings -> settings
                        .connectTimeout(connectTimeoutMs, TimeUnit.MILLISECONDS)
                        .readTimeout(readTimeoutMs, TimeUnit.MILLISECONDS));
    }
}
