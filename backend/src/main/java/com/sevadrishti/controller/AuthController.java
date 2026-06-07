package com.sevadrishti.controller;

import com.sevadrishti.config.JwtUtil;
import com.sevadrishti.model.User;
import com.sevadrishti.model.Volunteer;
import com.sevadrishti.repository.UserRepository;
import com.sevadrishti.repository.VolunteerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
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
        String email = (String) body.get("email");
        if (userRepo.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        User user = new User();
        user.setName((String) body.get("name"));
        user.setEmail(email);
        user.setPassword(encoder.encode((String) body.get("password")));
        user.setRole((String) body.getOrDefault("role", "VOLUNTEER"));
        user.setPhone((String) body.get("phone"));
        user = userRepo.save(user);

        // If volunteer, create volunteer profile
        if ("VOLUNTEER".equals(user.getRole())) {
            Volunteer v = new Volunteer();
            v.setUserId(user.getId());
            v.setName(user.getName());
            v.setEmail(user.getEmail());
            v.setPhone(user.getPhone());
            v.setAge(body.get("age") != null ? ((Number) body.get("age")).intValue() : null);
            v.setEmergencyContact((String) body.get("emergencyContact"));
            v.setAddress((String) body.get("address"));
            v.setSkills((java.util.List<String>) body.get("skills"));
            v.setLanguages((java.util.List<String>) body.get("languages"));
            v.setFitnessLevel((String) body.getOrDefault("fitnessLevel", "MEDIUM"));
            v.setExperience((String) body.get("experience"));
            v.setAvailableFrom((String) body.get("availableFrom"));
            v.setAvailableTo((String) body.get("availableTo"));
            v.setShiftPreference((String) body.getOrDefault("shiftPreference", "ANY"));
            v.setPreferredZones((java.util.List<String>) body.get("preferredZones"));
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
        String email = body.get("email");
        String password = body.get("password");

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
}
