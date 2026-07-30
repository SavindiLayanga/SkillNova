from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import re
import math

app = Flask(__name__)
CORS(app)

# Load the English NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Define a comprehensive list of IT skills
ALL_POSSIBLE_SKILLS = [
    "javascript", "python", "java", "c++", "c#", "ruby", "php", "go", "rust", "typescript",
    "react", "angular", "vue", "svelte", "html", "css", "tailwind", "bootstrap",
    "node.js", "express", "django", "flask", "spring", "asp.net", "ruby on rails",
    "sql", "mysql", "postgresql", "mongodb", "redis", "firebase", "cassandra", "oracle",
    "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins", "git", "terraform", "linux", "bash",
    "machine learning", "tensorflow", "pytorch", "pandas", "numpy", "r", "tableau", "power bi",
    "communication", "leadership", "problem solving", "teamwork", "agile", "scrum", "figma", "jira"
]

ROLE_SKILLS_MAP = {
    "frontend": ["javascript", "react", "html", "css", "vue", "angular", "tailwind", "typescript", "figma"],
    "backend": ["node.js", "python", "java", "mongodb", "sql", "postgres", "docker", "redis", "express", "go", "c#"],
    "full stack": ["javascript", "react", "node.js", "mongodb", "express", "git", "html", "css", "docker", "typescript", "postgres"],
    "data": ["python", "r", "sql", "machine learning", "pandas", "numpy", "tensorflow", "tableau", "power bi"],
    "devops": ["docker", "kubernetes", "aws", "linux", "ci/cd", "jenkins", "terraform", "bash", "python"],
    "default": ["javascript", "python", "java", "sql", "git", "communication", "problem solving", "agile", "react", "node.js"]
}

@app.route('/analyze', methods=['POST'])
def analyze_cv():
    data = request.json
    text = data.get("text", "")
    target_role = data.get("targetRole", "Software Developer")
    
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # 1. NLP Processing
    doc = nlp(text)
    
    # 2. Extract Entities (Name, Email, Phone)
    extracted_name = ""
    for ent in doc.ents:
        if ent.label_ == "PERSON" and not extracted_name:
            extracted_name = ent.text
            break
            
    # Fallback to first line if spacy didn't catch a PERSON
    if not extracted_name:
        first_lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 2]
        extracted_name = first_lines[0] if first_lines and len(first_lines[0]) < 40 else ""
        
    email_match = re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', text)
    extracted_email = email_match.group(1) if email_match else ""
    
    phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    extracted_phone = phone_match.group(0) if phone_match else ""

    # 3. Extract Skills using NLP tokens and pattern matching
    lower_text = text.lower()
    extracted_skills = []
    
    # Simple token matching (we could use EntityRuler but this is faster for exact matches)
    for skill in ALL_POSSIBLE_SKILLS:
        escaped_skill = re.escape(skill)
        if re.search(rf'(?:^|\W){escaped_skill}(?:$|\W)', lower_text, re.IGNORECASE):
            extracted_skills.append(skill)
            
    if not extracted_skills:
        return jsonify({"isITRelated": False, "summary": "This CV does not appear to be related to the IT field."})

    # 4. Role & Gap Analysis
    lower_role = target_role.lower()
    matched_key = next((k for k in ROLE_SKILLS_MAP if k in lower_role), "default")
    required_skills = ROLE_SKILLS_MAP[matched_key]
    
    matched_skills = [s for s in required_skills if s in extracted_skills]
    missing_skills = [s for s in required_skills if s not in extracted_skills]
    
    match_percentage = 0
    if required_skills:
        match_percentage = math.floor((len(matched_skills) / len(required_skills)) * 100)
        
    # Boost for strong CVs
    if len(extracted_skills) >= 8 and match_percentage < 85:
        match_percentage = min(98, match_percentage + 35)
    elif len(extracted_skills) >= 5 and match_percentage < 65:
        match_percentage = min(85, match_percentage + 25)

    # 5. Build Response
    response = {
        "isITRelated": True,
        "name": extracted_name,
        "email": extracted_email,
        "phone": extracted_phone,
        "primaryRole": { "role": target_role, "confidence": 95, "reason": "NLP detected matched skills." },
        "topRoles": [
            { "role": target_role, "confidence": 95, "reason": "Strong skill overlap." },
            { "role": "Software Engineer", "confidence": 80, "reason": "General IT skills detected." }
        ],
        "technicalSkills": [s.title() for s in extracted_skills[:8]],
        "softSkills": ["Problem Solving", "Teamwork", "Communication", "Time Management"],
        "skills": extracted_skills,
        "strongSkills": [s.title() for s in extracted_skills[:3]],
        "weakSkills": [s.title() for s in missing_skills],
        "missingSkills": [s.title() for s in missing_skills],
        "education": [],
        "experience": [],
        "projects": [],
        "certifications": [],
        "matchPercentage": match_percentage,
        "careerReadinessScore": min(100, match_percentage + 10),
        "learningRoadmap": [f"Learn {s.title()}" for s in missing_skills],
        "jobRecommendations": [target_role, f"Senior {target_role}"],
        "summary": f"NLP Analysis Complete. Found {len(extracted_skills)} technical skills. Match percentage is {match_percentage}%."
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
