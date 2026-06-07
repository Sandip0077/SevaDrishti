package com.sevadrishti.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "incidents")
public class Incident {
    @Id
    private String id;
    private String type;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String zoneId;
    private String zoneName;
    private String description;
    private String status = "OPEN"; // OPEN, RESPONDING, RESOLVED
    private List<String> assignedVolunteers = new ArrayList<>();
    private Instant createdAt = Instant.now();
    private Instant resolvedAt;
}
