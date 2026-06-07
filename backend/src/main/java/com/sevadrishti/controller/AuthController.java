package com.sevadrishti.controller;

import com.sevadrishti.config.JwtUtil;
import com.sevadrishti.model.User;
import com.sevadrishti.model.Volunteer;
import com.sevadrishti.repository.UserRepository;
import com.sevadrishti.repository.VolunteerRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Set<String> ALLOWED_ROLES = Set.of("ADMIN", "COORDINATOR", "VOLUNTEER");

    private final UserRepository userRepo;
    private final VolunteerRepository volunteerRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepo, VolunteerRepository volunteerRepo,
                          PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.volunteerRepo = volunteerRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String name = normalize((String) body.get("name"));
        String email = normalizeEmail((String) body.get("email"));
        String password = (String) body.get("password");
        String phone = normalize((String) body.get("phone"));
        String role = normalize((String) body.getOrDefault("role", "VOLUNTEER"));

        if (name == null || email == null || password == null || password.length() < 6 || phone == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, email, phone, and a 6+ character password are required"));
        }
        if (role == null || !ALLOWED_ROLES.contains(role)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid user role"));
        }
        if (userRepo.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRole(role);
        user.setPhone(phone);

        try {
            user = userRepo.save(user);
        } catch (DuplicateKeyException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        // If volunteer, create volunteer profile
        if ("VOLUNTEER".equals(user.getRole())) {
            Volunteer v = new Volunteer();
            v.setUserId(user.getId());
            v.setName(user.getName());
            v.setEmail(user.getEmail());
            v.setPhone(user.getPhone());
            v.setAge(toInteger(body.get("age")));
            v.setEmergencyContact(normalize((String) body.get("emergencyContact")));
            v.setAddress(normalize((String) body.get("address")));
            v.setSkills(toStringList(body.get("skills")));
            v.setLanguages(toStringList(body.get("languages")));
            v.setFitnessLevel(normalize((String) body.getOrDefault("fitnessLevel", "MEDIUM")));
            v.setExperience(normalize((String) body.get("experience")));
            v.setAvailableFrom(normalize((String) body.get("availableFrom")));
            v.setAvailableTo(normalize((String) body.get("availableTo")));
            v.setShiftPreference(normalize((String) body.getOrDefault("shiftPreference", "ANY")));
            v.setPreferredZones(toStringList(body.get("preferredZones")));
            volunteerRepo.save(v);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());
        return ResponseEntity.ok(Map.of("token", token, "user", userData));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = normalizeEmail(body.get("email"));
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        return userRepo.findByEmail(email)
                .filter(u -> encoder.matches(password, u.getPassword()))
                .map(u -> {
                    String token = jwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole());
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("id", u.getId());
                    userData.put("name", u.getName());
                    userData.put("email", u.getEmail());
                    userData.put("role", u.getRole());
                    return ResponseEntity.ok(Map.of("token", token, "user", (Object) userData));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("message", (Object) "Invalid email or password")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        String userId = (String) auth.getPrincipal();
        return userRepo.findById(userId)
                .map(u -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", u.getId());
                    data.put("name", u.getName());
                    data.put("email", u.getEmail());
                    data.put("role", u.getRole());
                    return ResponseEntity.ok(data);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "message", "SevaDrishti Backend is running"));
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeEmail(String value) {
        String normalized = normalize(value);
        return normalized == null ? null : normalized.toLowerCase();
    }

    private Integer toInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.intValue();
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private List<String> toStringList(Object value) {
        if (!(value instanceof List<?> list)) return List.of();
        return list.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .map(this::normalize)
                .filter(item -> item != null)
                .distinct()
                .toList();
    }
}
