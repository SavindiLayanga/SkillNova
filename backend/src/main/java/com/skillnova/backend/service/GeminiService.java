package com.skillnova.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String analyzeCV(String cvText) throws Exception {
        if ("your_api_key_here".equals(apiKey)) {
            throw new Exception("Gemini API key is missing or invalid in application.properties");
        }

        String prompt = "You are an expert career guidance assistant. Analyze the following CV text and extract the information into a structured JSON format.\n" +
                "If any information is missing or unclear, try to infer it or leave the array/string empty.\n\n" +
                "CRITICAL INSTRUCTION FOR SKILL GAPS: When determining the \"missingSkills\", you MUST specifically compare the candidate's extracted \"skills\" against the standard industry requirements for their \"targetRole\". The missingSkills array must ONLY contain skills that are crucial for the targetRole but are missing from their CV.\n\n" +
                "Return exactly and ONLY a JSON object with the following structure:\n" +
                "{\n" +
                "  \"name\": \"Candidate's full name\",\n" +
                "  \"email\": \"Candidate's email address\",\n" +
                "  \"skills\": [\n" +
                "    {\n" +
                "      \"name\": \"Skill name (e.g. React, Node.js, Communication)\",\n" +
                "      \"category\": \"One of: Frontend, Backend, Mobile Development, Database, Cloud, DevOps, Soft Skills\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"education\": [\n" +
                "    {\n" +
                "      \"title\": \"Degree or certificate title\",\n" +
                "      \"provider\": \"University or institution\",\n" +
                "      \"detail\": \"Any relevant details, grades, or focus areas\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"experience\": [\n" +
                "    {\n" +
                "      \"role\": \"Job title\",\n" +
                "      \"place\": \"Company or organization\",\n" +
                "      \"period\": \"Duration\",\n" +
                "      \"detail\": \"Summary of responsibilities and achievements\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"projects\": [\n" +
                "    {\n" +
                "      \"title\": \"Project name\",\n" +
                "      \"detail\": \"Project description and technologies used\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"certifications\": [\n" +
                "    \"String array of certification names\"\n" +
                "  ],\n" +
                "  \"targetRole\": \"The main role the candidate is suited for (e.g., 'Frontend Developer', 'Data Scientist')\",\n" +
                "  \"careerRecommendations\": [\n" +
                "    {\n" +
                "      \"role\": \"Recommended job role\",\n" +
                "      \"matchPercentage\": \"Number representing match percentage (e.g. 85)\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"missingSkills\": [\n" +
                "    {\n" +
                "      \"skill\": \"Name of the missing skill\",\n" +
                "      \"recommendation\": \"Brief recommendation on how to learn it\",\n" +
                "      \"priority\": \"High, Medium, or Low\",\n" +
                "      \"current\": 20,\n" +
                "      \"required\": 80\n" +
                "    }\n" +
                "  ],\n" +
                "  \"jobMatches\": [\n" +
                "    {\n" +
                "      \"role\": \"Job role title\",\n" +
                "      \"company\": \"Fictional company or realistic example\",\n" +
                "      \"type\": \"Full-time / Part-time / Remote\",\n" +
                "      \"source\": \"LinkedIn / Glassdoor\",\n" +
                "      \"location\": \"City, Country or Remote\",\n" +
                "      \"salary\": \"Estimated salary range\",\n" +
                "      \"skills\": [\"Skill 1\", \"Skill 2\"],\n" +
                "      \"match\": 85,\n" +
                "      \"url\": \"#\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"skillMatchScore\": \"Overall skill match score out of 100 for their target role (number)\",\n" +
                "  \"cvScore\": \"Overall CV quality score out of 100 (number)\",\n" +
                "  \"learningPath\": [\n" +
                "    {\n" +
                "      \"skill\": \"Name of the missing skill\",\n" +
                "      \"courses\": [\"Course name 1\", \"Course name 2\"],\n" +
                "      \"certifications\": [\"Certification name 1\"],\n" +
                "      \"projects\": [\"Project idea to practice this skill\"]\n" +
                "    }\n" +
                "  ],\n" +
                "  \"aiInsights\": \"Human-readable feedback such as: 'Your profile is strong in React and JavaScript but lacks TypeScript, API Integration, and Testing skills required for a Junior React Developer role.'\"\n" +
                "}\n\n" +
                "CV Text:\n\"\"\"\n" + cvText + "\n\"\"\"\n";

        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> contentPart = new HashMap<>();
        contentPart.put("text", prompt);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(contentPart));
        
        requestBody.put("contents", Collections.singletonList(content));
        
        Map<String, Object> config = new HashMap<>();
        config.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", config);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String fullUrl = apiUrl + "?key=" + apiKey;

        ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, entity, Map.class);
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> contentResp = (Map<String, Object>) candidates.get(0).get("content");
                if (contentResp != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResp.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        if (text != null) {
                            if (text.startsWith("```json")) {
                                text = text.replaceFirst("^```json\\n", "").replaceFirst("\\n```$", "");
                            }
                            return text;
                        }
                    }
                }
            }
        }
        
        throw new Exception("Invalid response from Gemini API");
    }
}
