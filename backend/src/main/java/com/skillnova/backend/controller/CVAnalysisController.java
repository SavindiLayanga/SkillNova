package com.skillnova.backend.controller;

import com.skillnova.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CVAnalysisController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/analyze-cv")
    public ResponseEntity<?> analyzeCV(@RequestBody Map<String, String> payload) {
        try {
            String text = payload.get("text");
            if (text == null || text.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "CV text is required"));
            }

            String result = geminiService.analyzeCV(text);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to analyze CV"));
        }
    }
}
