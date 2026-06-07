package com.sevadrishti.repository;

import com.sevadrishti.model.Zone;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ZoneRepository extends MongoRepository<Zone, String> {
}
