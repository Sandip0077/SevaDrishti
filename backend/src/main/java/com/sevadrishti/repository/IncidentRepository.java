package com.sevadrishti.repository;

import com.sevadrishti.model.Incident;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface IncidentRepository extends MongoRepository<Incident, String> {
    List<Incident> findByStatus(String status);
    List<Incident> findByZoneId(String zoneId);
}
