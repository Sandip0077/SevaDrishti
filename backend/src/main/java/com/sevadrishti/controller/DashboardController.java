package com.sevadrishti.controller;

import com.sevadrishti.repository.*;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final VolunteerRepository volunteerRepo;
    private final ZoneRepository zoneRepo;
    private final IncidentRepository incidentRepo;
    private final ShiftRepository shiftRepo;

    public DashboardController(VolunteerRepository volunteerRepo, ZoneRepository zoneRepo,
                               IncidentRepository incidentRepo, ShiftRepository shiftRepo) {
        this.volunteerRepo = volunteerRepo;
        this.zoneRepo = zoneRepo;
        this.incidentRepo = incidentRepo;
        this.shiftRepo = shiftRepo;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        var volunteers = volunteerRepo.findAll();
        var zones = zoneRepo.findAll();
        var openIncidents = incidentRepo.findByStatus("OPEN");
        var resolvedIncidents = incidentRepo.findByStatus("RESOLVED");

        long available = volunteers.stream().filter(v -> "AVAILABLE".equals(v.getStatus())).count();
        long deployed = volunteers.stream().filter(v -> "DEPLOYED".equals(v.getStatus())).count();
        long offDuty = volunteers.stream().filter(v -> "OFF_DUTY".equals(v.getStatus())).count();
        double avgFatigue = volunteers.stream().mapToDouble(v -> v.getFatigueScore()).average().orElse(0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVolunteers", volunteers.size());
        stats.put("activeVolunteers", deployed);
        stats.put("totalZones", zones.size());
        stats.put("openIncidents", openIncidents.size());
        stats.put("resolvedIncidents", resolvedIncidents.size());
        stats.put("availableCount", available);
        stats.put("deployedCount", deployed);
        stats.put("offDutyCount", offDuty);
        stats.put("avgFatigueScore", Math.round(avgFatigue));
        return stats;
    }

    @GetMapping("/activity-feed")
    public java.util.List<Map<String, Object>> getActivityFeed() {
        // Return recent allocations and incidents as activity
        return new java.util.ArrayList<>();
    }
}
