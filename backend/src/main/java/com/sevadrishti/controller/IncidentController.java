package com.sevadrishti.controller;

import com.sevadrishti.model.Incident;
import com.sevadrishti.repository.IncidentRepository;
import com.sevadrishti.repository.ZoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {
    private final IncidentRepository repo;
    private final ZoneRepository zoneRepo;

    public IncidentController(IncidentRepository repo, ZoneRepository zoneRepo) {
        this.repo = repo;
        this.zoneRepo = zoneRepo;
    }

    @GetMapping
    public List<Incident> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getById(@PathVariable String id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Incident create(@RequestBody Incident incident) {
        // Resolve zone name
        if (incident.getZoneId() != null) {
            zoneRepo.findById(incident.getZoneId()).ifPresent(z -> incident.setZoneName(z.getName()));
        }
        return repo.save(incident);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return repo.findById(id).map(inc -> {
            inc.setStatus(body.get("status"));
            if ("RESOLVED".equals(body.get("status"))) inc.setResolvedAt(Instant.now());
            return ResponseEntity.ok(repo.save(inc));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/mobilize")
    public ResponseEntity<?> mobilize(@PathVariable String id) {
        return repo.findById(id).map(inc -> {
            inc.setStatus("RESPONDING");
            repo.save(inc);
            return ResponseEntity.ok(Map.of("message", "Mobilization initiated", "incidentId", id));
        }).orElse(ResponseEntity.notFound().build());
    }
}
