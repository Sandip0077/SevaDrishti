package com.sevadrishti.repository;

import com.sevadrishti.model.Shift;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ShiftRepository extends MongoRepository<Shift, String> {
    List<Shift> findByVolunteerId(String volunteerId);
    List<Shift> findByZoneId(String zoneId);
}
