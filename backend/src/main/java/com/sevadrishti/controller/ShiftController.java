package com.sevadrishti.controller;

import com.sevadrishti.model.Shift;
import com.sevadrishti.repository.ShiftRepository;
import com.sevadrishti.repository.VolunteerRepository;
import com.sevadrishti.repository.ZoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {
    private final ShiftRepository repo;
    private final VolunteerRepository volunteerRepo;
    private final ZoneRepository zoneRepo;

    public ShiftController(ShiftRepository repo, VolunteerRepository volunteerRepo, ZoneRepository zoneRepo) {
        this.repo = repo;
        this.volunteerRepo = volunteerRepo;
        this.zoneRepo = zoneRepo;
    }

    @GetMapping
    public List<Shift> getAll() { return repo.findAll(); }

    @GetMapping("/volunteer/{volunteerId}")
    public List<Shift> getByVolunteer(@PathVariable String volunteerId) {
        return repo.findByVolunteerId(volunteerId);
    }

    @PostMapping
    public Shift create(@RequestBody Shift shift) {
        if (shift.getVolunteerId() != null) {
            volunteerRepo.findById(shift.getVolunteerId()).ifPresent(v -> shift.setVolunteerName(v.getName()));
        }
        if (shift.getZoneId() != null) {
            zoneRepo.findById(shift.getZoneId()).ifPresent(z -> shift.setZoneName(z.getName()));
        }
        return repo.save(shift);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shift> update(@PathVariable String id, @RequestBody Shift data) {
        return repo.findById(id).map(s -> {
            if (data.getStatus() != null) s.setStatus(data.getStatus());
            if (data.getStartTime() != null) s.setStartTime(data.getStartTime());
            if (data.getEndTime() != null) s.setEndTime(data.getEndTime());
            if (data.getTaskIntensity() != null) s.setTaskIntensity(data.getTaskIntensity());
            return ResponseEntity.ok(repo.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/swap-request")
    public ResponseEntity<?> swapRequest(@RequestBody java.util.Map<String, String> body) {
        // Simple swap request - in production this would create a swap request entity
        return ResponseEntity.ok(java.util.Map.of("message", "Swap request submitted", "status", "PENDING"));
    }
}
