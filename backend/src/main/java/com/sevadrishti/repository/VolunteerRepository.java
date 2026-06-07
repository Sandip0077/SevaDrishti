package com.sevadrishti.repository;

import com.sevadrishti.model.Volunteer;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface VolunteerRepository extends MongoRepository<Volunteer, String> {
    Optional<Volunteer> findByUserId(String userId);
    Optional<Volunteer> findByEmail(String email);
    List<Volunteer> findByStatus(String status);
    List<Volunteer> findByCurrentZone(String zone);
    List<Volunteer> findBySkillsContaining(String skill);
}
