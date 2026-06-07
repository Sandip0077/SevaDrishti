package com.sevadrishti.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "volunteers")
public class Volunteer {
    @Id
    private String id;
    private String userId;
    private String name;
    private String email;
    private String phone;
    private Integer age;
    private String emergencyContact;
    private String address;
    private List<String> skills;
    private List<String> languages;
    private String fitnessLevel; // HIGH, MEDIUM, LOW
    private String experience;
    private String availableFrom;
    private String availableTo;
    private String shiftPreference; // ANY, MORNING, AFTERNOON, NIGHT
    private List<String> preferredZones;
    private String currentZone;
    private String status = "AVAILABLE"; // AVAILABLE, DEPLOYED, OFF_DUTY
    private double fatigueScore = 0;
    private int shiftsCompleted = 0;
    private double totalHoursWorked = 0;
    private Instant createdAt = Instant.now();
}
