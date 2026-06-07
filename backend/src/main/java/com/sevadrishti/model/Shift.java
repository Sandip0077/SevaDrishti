package com.sevadrishti.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Document(collection = "shifts")
public class Shift {
    @Id
    private String id;
    private String volunteerId;
    private String volunteerName;
    private String zoneId;
    private String zoneName;
    private Instant startTime;
    private Instant endTime;
    private String taskIntensity = "MEDIUM"; // LOW, MEDIUM, HIGH
    private String status = "UPCOMING"; // UPCOMING, ACTIVE, COMPLETED
    private Instant createdAt = Instant.now();
}
