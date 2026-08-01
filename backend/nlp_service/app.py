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
    lower_text = text.lower()
    
    # 2.1 Detect Actual Role from CV First (to help find Name)
    COMMON_ROLES = [
        "software engineer", "software developer", "web developer", "frontend developer", "backend developer", "full stack developer",
        "data scientist", "data analyst", "devops engineer", "ui/ux designer", "ui designer", "ux designer", "system administrator",
        "quality assurance", "qa engineer", "business analyst", "project manager", "product manager", "scrum master",
        "chef", "teacher", "accountant", "doctor", "nurse", "manager", "driver", "cashier", 
        "sales executive", "marketing manager", "hr manager", "graphic designer", "civil engineer",
        "cook", "sous chef", "executive chef", "mechanic", "electrician", "plumber"
    ]
    
    detected_role = "Unknown Role"
    role_line_index = -1
    
    # Priority 1: Check the first 15 lines (header/summary area) for the role
    for i, line in enumerate(lines[:15]):
        for role in COMMON_ROLES:
            if re.search(rf'(?:^|\W){role}(?:$|\W)', line, re.IGNORECASE):
                detected_role = role.title()
                role_line_index = i
                break
        if detected_role != "Unknown Role":
            break
            
    # Priority 2: If not in the header, search the whole text
    if detected_role == "Unknown Role":
        for i, line in enumerate(lines):
            for role in COMMON_ROLES:
                if re.search(rf'(?:^|\W){role}(?:$|\W)', line, re.IGNORECASE):
                    detected_role = role.title()
                    role_line_index = i
                    break
            if detected_role != "Unknown Role":
                break
                
    # 2.2 Name Heuristic
    extracted_name = ""
    
    # Let's run Spacy specifically on the first 5 lines to find a PERSON
    spacy_name_top = ""
    for i, line in enumerate(lines[:5]):
        doc_line = nlp(line)
        for ent in doc_line.ents:
            if ent.label_ == "PERSON":
                spacy_name_top = ent.text
                break
        if spacy_name_top:
            break
            
    if spacy_name_top and len(spacy_name_top.split()) > 1:
        extracted_name = spacy_name_top
        
    # If Spacy couldn't find a multi-word name at the top, let's use heuristics
    if not extracted_name:
        # User's heuristic: if role is at the very top (line 1 or 2), the name is above it
        if 0 < role_line_index <= 3:
            candidate = lines[role_line_index - 1]
            if not re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', candidate) and not re.search(r'\d{7,}', candidate):
                extracted_name = candidate
                
    # Fallback to normal heuristic: The very first valid line
    if not extracted_name:
        for line in lines[:5]:
            # If it's short, not an email/phone, and doesn't have keywords like 'skills' or 'profile'
            if not re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', line) and not re.search(r'\d{7,}', line) and 2 < len(line) < 40:
                if not any(k in line.lower() for k in ["profile", "summary", "skills", "objective", "curriculum vitae", "resume", "cv"]):
                    extracted_name = line
                    break
            
    email_match = re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', text)
    extracted_email = email_match.group(1) if email_match else ""
    
    # Foolproof Name Fallback: If still no name, derive from email or PDF title
    if not extracted_name and extracted_email:
        name_part = extracted_email.split('@')[0]
        name_part = re.sub(r'[0-9]+', '', name_part)
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
    
    # Better Education Extraction (State Machine)
    dynamic_education = []
    edu_keywords = ["university", "college", "institute", "school", "bsc", "bachelor", "master", "degree", "diploma", "campus", "academy", "phd"]
    date_regex = r'(?<!\d)((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[a-z]*\s*\d{4})\s*(?:-|to|–)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[a-z]*\s*\d{4}|Present|Current|Now|Till Date)(?!\d)'
    single_year_regex = r'(?<!\d)(20\d{2}|19\d{2})(?!\d)'
    
    in_edu_section = False
    current_edu = None
    
    for i, line in enumerate(lines):
        lower_line = line.lower()
        if lower_line in ["education", "academic background", "qualifications", "academic qualifications"]:
            in_edu_section = True
            continue
        elif lower_line in ["experience", "work experience", "skills", "projects", "certifications", "references", "employment"]:
            in_edu_section = False
            
        if in_edu_section:
            range_match = re.search(date_regex, line, re.IGNORECASE)
            single_match = re.search(single_year_regex, line)
            has_keyword = any(k in lower_line for k in edu_keywords)
            
            is_new_edu = range_match or single_match or (has_keyword and not current_edu)
            
            if is_new_edu:
                if current_edu:
                    dynamic_education.append(current_edu)
                    
                start_d = range_match.group(1) if range_match else "Unknown"
                end_d = range_match.group(2) if range_match else (single_match.group(1) if single_match else "Unknown")
                
                text_without_date = line
                if range_match: text_without_date = re.sub(date_regex, '', line, flags=re.IGNORECASE)
                elif single_match: text_without_date = re.sub(single_year_regex, '', line)
                text_without_date = text_without_date.strip(' -|,:')
                
                degree_guess = text_without_date if len(text_without_date) > 5 else "Detected Qualification"
                institution_guess = lines[i-1] if i > 0 and len(lines[i-1]) < 80 else "Unknown Institution"
                
                if any(k in degree_guess.lower() for k in ["university", "college", "institute", "school"]):
                    temp = institution_guess
                    institution_guess = degree_guess
                    degree_guess = temp if len(temp) > 5 else "Detected Qualification"
                    
                current_edu = {
                    "institution": institution_guess,
                    "degree": degree_guess,
                    "fieldOfStudy": "General",
                    "startYear": start_d,
                    "endYear": end_d
                }
            elif current_edu and len(current_edu["degree"]) < 100:
                if len(line) > 5:
                    current_edu["degree"] += " | " + line

    if current_edu:
        dynamic_education.append(current_edu)
        
    if not dynamic_education:
        edu_line = next((l for l in lines if any(k in l.lower() for k in edu_keywords) and 10 < len(l) < 80), None)
        if edu_line:
            dynamic_education.append({"institution": edu_line, "degree": "Detected Qualification", "fieldOfStudy": "General", "startYear": "2018", "endYear": "2022"})

    # Better Experience Extraction (State Machine)
    dynamic_experience = []
    exp_keywords = ["developer", "engineer", "manager", "intern", "ltd", "inc", "technologies", "solutions", "pvt", "software", "chef", "cook", "restaurant", "hotel", "kitchen", "work", "experience"]
    job_title_keywords = ["developer", "engineer", "manager", "intern", "analyst", "designer", "consultant", "administrator", "lead", "architect"]
    
    in_exp_section = False
    current_exp = None
    
    for i, line in enumerate(lines):
        lower_line = line.lower()
        if lower_line in ["experience", "work experience", "employment history", "professional experience", "work history", "employment"]:
            in_exp_section = True
            continue
        elif lower_line in ["education", "skills", "projects", "certifications", "references", "academic background"]:
            in_exp_section = False
            
        if in_exp_section:
            match = re.search(date_regex, line, re.IGNORECASE)
            has_keyword = any(k in lower_line for k in exp_keywords)
            
            is_new_exp = match or (len(line) < 80 and has_keyword and not current_exp)
            
            if is_new_exp:
                if current_exp:
                    dynamic_experience.append(current_exp)
                    
                start_d = match.group(1) if match else "Unknown"
                end_d = match.group(2) if match else "Unknown"
                
                text_without_date = re.sub(date_regex, '', line, flags=re.IGNORECASE).strip(' -|,:')
                
                job_title_guess = text_without_date if len(text_without_date) > 5 else (detected_role if is_it_related else "Professional Role")
                company_guess = lines[i-1] if i > 0 and len(lines[i-1]) < 80 else "Unknown Company"
                
                if any(k in company_guess.lower() for k in job_title_keywords) and not any(k in text_without_date.lower() for k in job_title_keywords):
                    temp = company_guess
                    company_guess = job_title_guess
                    job_title_guess = temp if len(temp) > 5 else "Professional Role"
                    
                current_exp = {
                    "company": company_guess,
                    "jobTitle": job_title_guess,
                    "startDate": start_d,
                    "endDate": end_d,
                    "description": ""
                }
            elif current_exp:
                if len(line) > 5 and len(current_exp["description"]) < 300:
                    current_exp["description"] += line + " "

    if current_exp:
        dynamic_experience.append(current_exp)
        
    if not dynamic_experience:
        exp_line = next((l for l in lines if any(k in l.lower() for k in exp_keywords) and 10 < len(l) < 80), None)
        if exp_line:
            dynamic_experience.append({"company": exp_line, "jobTitle": detected_role, "startDate": "2020", "endDate": "Present", "description": "Extracted experience based on keywords."})

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
