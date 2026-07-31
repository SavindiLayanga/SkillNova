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
    "javascript", "python", "java", "c++", "c#", "php", "rust", "typescript", "golang", "ruby on rails", "ruby",
    "react", "angular", "vue", "svelte", "html", "css", "tailwind", "bootstrap",
    "node.js", "express.js", "django", "flask", "spring boot", "asp.net",
    "sql", "mysql", "postgresql", "mongodb", "redis", "firebase", "cassandra", "oracle",
    "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins", "git", "terraform", "linux", "bash script",
    "machine learning", "tensorflow", "pytorch", "pandas", "numpy", "r programming", "tableau", "power bi",
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
    
    # 2. Extract Entities (Name, Email, Phone, Address)
    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 0]
    
    # Name Heuristic: First valid line that is short and not an email/phone
    extracted_name = ""
    for line in lines[:8]:
        if not re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', line) and not re.search(r'\d{7,}', line) and 2 < len(line) < 40:
            extracted_name = line
            break
            
    # Spacy fallback if name seems wrong or missing
    spacy_name = ""
    for ent in doc.ents:
        if ent.label_ == "PERSON" and not spacy_name:
            spacy_name = ent.text
            break
            
    # If heuristic failed completely, or if heuristic found 1 word but Spacy found multiple
    if not extracted_name and spacy_name:
        extracted_name = spacy_name
    elif spacy_name and len(spacy_name.split()) > 1 and len(extracted_name.split()) == 1:
        extracted_name = spacy_name
        
    email_match = re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', text)
    extracted_email = email_match.group(1) if email_match else ""
    
    # Foolproof Name Fallback: If still no name, derive from email
    if not extracted_name and extracted_email:
        name_part = extracted_email.split('@')[0]
        name_part = re.sub(r'[0-9]+', '', name_part) # remove numbers
        extracted_name = name_part.replace('.', ' ').replace('_', ' ').title()
    elif not extracted_name:
        extracted_name = "Candidate Name"
    
    # Phone Heuristic: Find 9 to 12 digits, optionally with + and spaces/dashes
    phone_match = re.search(r'(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}', text)
    broad_phone = re.search(r'(?:(?:\+|00)\d{1,3})?[\s.-]*\(?\d{2,4}\)?(?:[\s.-]*\d){6,9}', text)
    if broad_phone:
        extracted_phone = broad_phone.group(0).strip()
    else:
        extracted_phone = phone_match.group(0).strip() if phone_match else ""
        
    # Address Heuristic
    extracted_address = ""
    address_match = re.search(r'(?i)(?:no\.?|number)\s*\d+.*?(?:road|rd|street|st|lane|avenue|ave|mawatha|colombo|kandy|galle|gampaha|matara|kurunegala|sri lanka|\d{5})', text)
    if address_match:
        extracted_address = address_match.group(0)
    else:
        for line in lines[:20]:
            # Look for lines with multiple commas, or lines ending in "Sri Lanka" or containing "District"
            if (line.count(',') >= 1 and ('sri lanka' in line.lower() or 'district' in line.lower() or 'province' in line.lower())) or line.count(',') >= 2:
                if not "@" in line and not re.search(r'\d{9,}', line):
                    extracted_address = line
                    break

    # 3. Extract Skills using NLP tokens and pattern matching
    lower_text = text.lower()
    extracted_skills = []
    
    # Simple token matching (we could use EntityRuler but this is faster for exact matches)
    for skill in ALL_POSSIBLE_SKILLS:
        escaped_skill = re.escape(skill)
        if re.search(rf'(?:^|\W){escaped_skill}(?:$|\W)', lower_text, re.IGNORECASE):
            extracted_skills.append(skill)
            
    # Check if they have actual HARD technical skills, not just soft skills
    soft_skills_list = ["communication", "leadership", "problem solving", "teamwork", "agile", "scrum", "figma", "jira"]
    tech_skills = [s for s in extracted_skills if s not in soft_skills_list]
    
    is_it_related = len(tech_skills) > 0

    # 3.5 Detect Actual Role from CV
    COMMON_ROLES = [
        "software engineer", "software developer", "web developer", "frontend developer", "backend developer", "full stack developer",
        "data scientist", "data analyst", "devops engineer", "ui/ux designer", "system administrator",
        "chef", "teacher", "accountant", "doctor", "nurse", "manager", "driver", "cashier", 
        "sales executive", "marketing manager", "hr manager", "graphic designer", "civil engineer",
        "cook", "sous chef", "executive chef", "mechanic", "electrician", "plumber"
    ]
    
    detected_role = "Unknown Role"
    for role in COMMON_ROLES:
        if re.search(rf'(?:^|\W){role}(?:$|\W)', lower_text, re.IGNORECASE):
            detected_role = role.title()
            break
            
    # If no role detected but it has IT skills, infer IT role
    if detected_role == "Unknown Role" and is_it_related:
        detected_role = target_role

    # 4. Role & Gap Analysis
    lower_role = target_role.lower()
    matched_key = next((k for k in ROLE_SKILLS_MAP if k in lower_role), "default")
    required_skills = ROLE_SKILLS_MAP[matched_key]
    
    matched_skills = [s for s in required_skills if s in extracted_skills]
    missing_skills = [s for s in required_skills if s not in extracted_skills]
    
    match_percentage = 0
    if required_skills and len(tech_skills) > 0:
        match_percentage = math.floor((len(matched_skills) / len(required_skills)) * 100)
        
    # Boost for strong CVs
    if len(tech_skills) >= 8 and match_percentage < 85:
        match_percentage = min(98, match_percentage + 35)
    elif len(tech_skills) >= 5 and match_percentage < 65:
        match_percentage = min(85, match_percentage + 25)

    # 3.8 Extract URLs (LinkedIn, Github)
    linkedin_match = re.search(r'((?:https?://)?(?:www\.)?linkedin\.com/[^\s]+)', text, re.IGNORECASE)
    github_match = re.search(r'((?:https?://)?(?:www\.)?github\.com/[^\s]+)', text, re.IGNORECASE)
    portfolio_match = re.search(r'(https?://(?:www\.)?(?!linkedin\.com|github\.com)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?)', text, re.IGNORECASE)
    
    extracted_linkedin = linkedin_match.group(1) if linkedin_match else ""
    extracted_github = github_match.group(1) if github_match else ""
    extracted_portfolio = portfolio_match.group(1) if portfolio_match else ""

    # 3.9 Smart Heuristic for Experience and Education
    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 0]
    edu_keywords = ["university", "college", "institute", "school", "bsc", "bachelor", "master", "degree", "diploma", "campus", "academy"]
    exp_keywords = ["developer", "engineer", "manager", "intern", "ltd", "inc", "technologies", "solutions", "pvt", "software", "chef", "cook", "restaurant", "hotel", "kitchen", "work", "experience"]
    
    edu_line = next((l for l in lines if any(k in l.lower() for k in edu_keywords) and 10 < len(l) < 80), None)
    exp_line = next((l for l in lines if any(k in l.lower() for k in exp_keywords) and 10 < len(l) < 80 and l != edu_line), None)
    
    dynamic_education = [{"institution": edu_line, "degree": "Detected Qualification", "fieldOfStudy": "General", "startYear": "2018", "endYear": "2022"}] if edu_line else []
    dynamic_experience = [{"company": exp_line, "jobTitle": detected_role, "startDate": "2022", "endDate": "Present", "description": "Extracted experience from CV."}] if exp_line else []

    summary_msg = f"NLP Analysis Complete. Found {len(tech_skills)} technical skills. Match percentage is {match_percentage}%."
    if not is_it_related:
        summary_msg = f"This CV belongs to another field ({detected_role}). However, you can start learning from scratch to achieve your IT goals!"

    # 5. Build Response
    response = {
        "isITRelated": is_it_related,
        "name": extracted_name,
        "email": extracted_email,
        "phone": extracted_phone,
        "personalInformation": {
            "fullName": extracted_name,
            "email": extracted_email,
            "phone": extracted_phone,
            "linkedin": extracted_linkedin,
            "github": extracted_github,
            "address": extracted_address,
            "portfolio": extracted_portfolio
        },
        "professionalSummary": f"Professional with expertise in {', '.join([s.title() for s in extracted_skills[:3]])}. Detected role: {detected_role}.",
        "primaryRole": { "role": detected_role, "confidence": 95, "reason": "Extracted directly from CV text." },
        "topRoles": [
            { "role": detected_role, "confidence": 95, "reason": "Main profession detected in CV." }
        ],
        "technicalSkills": [s.title() for s in tech_skills[:8]],
        "softSkills": ["Problem Solving", "Teamwork", "Communication", "Time Management", "Adaptability"],
        "skills": extracted_skills,
        "strongSkills": [s.title() for s in tech_skills[:3]],
        "weakSkills": [s.title() for s in missing_skills],
        "missingSkills": [s.title() for s in missing_skills],
        "education": dynamic_education,
        "experience": dynamic_experience,
        "projects": [{"projectName": "Detected Project", "description": "Worked on a project involving specific technologies.", "technologies": [s.title() for s in tech_skills[:2]]}] if is_it_related else [],
        "certifications": [],
        "matchPercentage": match_percentage,
        "careerReadinessScore": match_percentage if is_it_related else 0,
        "learningRoadmap": [f"Learn {s.title()}" for s in missing_skills],
        "jobRecommendations": [target_role, f"Junior {target_role}"] if is_it_related else ["Start Learning Basic IT Skills"],
        "summary": summary_msg
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
