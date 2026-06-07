package com.sevadrishti.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private ResponseEntity<?> proxyPost(String path, Object body) {
        String url = aiServiceUrl + path;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Object> entity = new HttpEntity<>(body, headers);
        try {
            return restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of(
                "message", "AI microservice communication failed", 
                "error", e.getMessage()
            ));
        }
    }

    private ResponseEntity<?> proxyGet(String path) {
        String url = aiServiceUrl + path;
        try {
            return restTemplate.exchange(url, HttpMethod.GET, null, Map.class);
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of(
                "message", "AI microservice communication failed", 
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/skill-match")
    public ResponseEntity<?> skillMatch(@RequestBody Map<String, Object> body) {
        return proxyPost("/ai/skill-match", body);
    }

    @PostMapping("/suggest-tags")
    public ResponseEntity<?> suggestTags(@RequestBody Map<String, Object> body) {
        return proxyPost("/ai/suggest-tags", body);
    }

    @PostMapping("/optimize-allocation")
    public ResponseEntity<?> optimizeAllocation(@RequestBody Map<String, Object> body) {
        return proxyPost("/ai/optimize-allocation", body);
    }

    @PostMapping("/predict-fatigue")
    public ResponseEntity<?> predictFatigue(@RequestBody Map<String, Object> body) {
        return proxyPost("/ai/predict-fatigue", body);
    }

    @PostMapping("/bulk-fatigue")
    public ResponseEntity<?> bulkFatigue(@RequestBody Map<String, Object> body) {
        return proxyPost("/ai/bulk-fatigue", body);
    }

    @PostMapping("/incident-responders")
    public ResponseEntity<?> incidentResponders(@RequestBody Map<String, Object> body) {
        return proxyPost("/ai/incident-responders", body);
    }

    @PostMapping("/rebalance-zones")
    public ResponseEntity<?> rebalanceZones(@RequestBody Map<String, Object> body) {
        return proxyPost("/ai/rebalance-zones", body);
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(@RequestBody Map<String, Object> body) {
        return proxyPost("/ai/analyze", body);
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return proxyGet("/health");
    }
}
