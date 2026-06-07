package com.sevadrishti.repository;

import com.sevadrishti.model.Allocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AllocationRepository extends MongoRepository<Allocation, String> {
    List<Allocation> findByZoneId(String zoneId);
    List<Allocation> findByVolunteerId(String volunteerId);
}
