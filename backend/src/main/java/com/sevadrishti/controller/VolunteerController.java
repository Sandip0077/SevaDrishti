package com.sevadrishti.controller;

import com.sevadrishti.model.Volunteer;
import com.sevadrishti.repository.VolunteerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/volunteers")
public class VolunteerController {
    private final VolunteerRepository repo;

    public VolunteerController(VolunteerRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Volunteer> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Volunteer> getById(@PathVariable String id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<Volunteer> getMyProfile(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return repo.findByUserId(userId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/available")
    public List<Volunteer> getAvailable() { return repo.findByStatus("AVAILABLE"); }

    @GetMapping("/by-zone/{zoneId}")
    public List<Volunteer> getByZone(@PathVariable String zoneId) { return repo.findByCurrentZone(zoneId); }

    @PostMapping
    public Volunteer create(@RequestBody Volunteer volunteer) { return repo.save(volunteer); }

    @PutMapping("/{id}")
    public ResponseEntity<Volunteer> update(@PathVariable String id, @RequestBody Volunteer data) {
        return repo.findById(id).map(v -> {
            if (data.getName() != null) v.setName(data.getName());
            if (data.getSkills() != null) v.setSkills(data.getSkills());
            if (data.getLanguages() != null) v.setLanguages(data.getLanguages());
            if (data.getFitnessLevel() != null) v.setFitnessLevel(data.getFitnessLevel());
            if (data.getStatus() != null) v.setStatus(data.getStatus());
            if (data.getCurrentZone() != null) v.setCurrentZone(data.getCurrentZone());
            if (data.getFatigueScore() > 0) v.setFatigueScore(data.getFatigueScore());
            return ResponseEntity.ok(repo.save(v));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (repo.existsById(id)) { repo.deleteById(id); return ResponseEntity.ok(Map.of("message", "Deleted")); }
        return ResponseEntity.notFound().build();
    }
}
