package com.sevadrishti.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Document(collection = "allocations")
public class Allocation {
    @Id
    private String id;
    private String volunteerId;
    private String volunteerName;
    private String zoneId;
    private String zoneName;
    private String assignedBy;
    private boolean aiRecommended;
    private double score;
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, CANCELLED
    private Instant createdAt = Instant.now();
}
