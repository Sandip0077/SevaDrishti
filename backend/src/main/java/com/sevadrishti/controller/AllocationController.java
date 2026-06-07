package com.sevadrishti.controller;

import com.sevadrishti.model.Allocation;
import com.sevadrishti.model.Volunteer;
import com.sevadrishti.model.Zone;
import com.sevadrishti.repository.AllocationRepository;
import com.sevadrishti.repository.VolunteerRepository;
import com.sevadrishti.repository.ZoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/allocations")
public class AllocationController {
    private final AllocationRepository repo;
    private final VolunteerRepository volunteerRepo;
    private final ZoneRepository zoneRepo;

    public AllocationController(AllocationRepository repo, VolunteerRepository volunteerRepo, ZoneRepository zoneRepo) {
        this.repo = repo;
        this.volunteerRepo = volunteerRepo;
        this.zoneRepo = zoneRepo;
    }

    @GetMapping
    public List<Allocation> getAll() { return repo.findAll(); }

    @GetMapping("/zone/{zoneId}")
    public List<Allocation> getByZone(@PathVariable String zoneId) { return repo.findByZoneId(zoneId); }

    @PostMapping("/assign")
    public ResponseEntity<?> assign(@RequestBody Map<String, Object> body) {
        String volunteerId = (String) body.get("volunteerId");
        String zoneId = (String) body.get("zoneId");

        Volunteer volunteer = volunteerRepo.findById(volunteerId).orElse(null);
        Zone zone = zoneRepo.findById(zoneId).orElse(null);
        if (volunteer == null || zone == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Volunteer or zone not found"));
        }

        // Update volunteer
        volunteer.setCurrentZone(zone.getName());
        volunteer.setStatus("DEPLOYED");
        volunteerRepo.save(volunteer);

        // Update zone count
        zone.setCurrentVolunteers(zone.getCurrentVolunteers() + 1);
        zoneRepo.save(zone);

        // Create allocation record
        Allocation alloc = new Allocation();
        alloc.setVolunteerId(volunteerId);
        alloc.setVolunteerName(volunteer.getName());
        alloc.setZoneId(zoneId);
        alloc.setZoneName(zone.getName());
        alloc.setAiRecommended(body.get("aiRecommended") != null && (boolean) body.get("aiRecommended"));
        alloc.setScore(body.get("score") != null ? ((Number) body.get("score")).doubleValue() : 0);
        alloc = repo.save(alloc);

        return ResponseEntity.ok(alloc);
    }
}
