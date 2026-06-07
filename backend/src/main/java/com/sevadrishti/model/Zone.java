package com.sevadrishti.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "zones")
public class Zone {
    @Id
    private String id;
    private String name;
    private String type; // GHAT, CAMP, MEDICAL, TRANSIT, etc.
    private double latitude;
    private double longitude;
    private int requiredVolunteers;
    private int currentVolunteers = 0;
    private double crowdDensity = 0;
    private String description;
    private String status = "ACTIVE";
}
