package com.sevadrishti.controller;

import com.sevadrishti.model.Zone;
import com.sevadrishti.repository.ZoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {
    private final ZoneRepository repo;

    public ZoneController(ZoneRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Zone> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Zone> getById(@PathVariable String id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Zone create(@RequestBody Zone zone) { return repo.save(zone); }

    @PutMapping("/{id}")
    public ResponseEntity<Zone> update(@PathVariable String id, @RequestBody Zone data) {
        return repo.findById(id).map(z -> {
            if (data.getName() != null) z.setName(data.getName());
            if (data.getType() != null) z.setType(data.getType());
            if (data.getLatitude() != 0) z.setLatitude(data.getLatitude());
            if (data.getLongitude() != 0) z.setLongitude(data.getLongitude());
            if (data.getRequiredVolunteers() > 0) z.setRequiredVolunteers(data.getRequiredVolunteers());
            if (data.getDescription() != null) z.setDescription(data.getDescription());
            return ResponseEntity.ok(repo.save(z));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/crowd-density")
    public ResponseEntity<Zone> updateCrowdDensity(@PathVariable String id, @RequestBody Map<String, Double> body) {
        return repo.findById(id).map(z -> {
            z.setCrowdDensity(body.getOrDefault("density", 0.0));
            return ResponseEntity.ok(repo.save(z));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (repo.existsById(id)) { repo.deleteById(id); return ResponseEntity.ok(Map.of("message", "Deleted")); }
        return ResponseEntity.notFound().build();
    }
}
