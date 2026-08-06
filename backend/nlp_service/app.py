import os
import re
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from spacy.matcher import PhraseMatcher
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
import sys
from nltk.stem import WordNetLemmatizer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from skillnova_ai import SkillNovaAI
skillnova_ai_engine = SkillNovaAI()

# --- Initialization ---
app = Flask(__name__)
CORS(app)

# NLTK Downloads
nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)
nltk.download("wordnet", quiet=True)
nltk.download("omw-1.4", quiet=True)

# SpaCy Load
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# --- Constants & Dictionaries ---
ALL_POSSIBLE_SKILLS = [
    "javascript", "python", "java", "c++", "c#", "php", "rust", "typescript", "golang", "ruby on rails", "ruby",
    "react", "angular", "vue", "svelte", "html", "css", "tailwind", "bootstrap",
    "node.js", "express.js", "django", "flask", "spring boot", "asp.net",
    "sql", "mysql", "postgresql", "mongodb", "redis", "firebase", "cassandra", "oracle",
    "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins", "git", "terraform", "linux", "bash script",
    "machine learning", "tensorflow", "pytorch", "pandas", "numpy", "r programming", "tableau", "power bi", "figma", "jira"
]

SOFT_SKILLS = [
    "communication", "leadership", "problem solving", "teamwork", "agile", "scrum", "time management", "adaptability",
    "critical thinking", "creativity"
]

COMMON_ROLES = [
    "software engineer", "software developer", "web developer", "frontend developer", "backend developer", "full stack developer",
    "data scientist", "data analyst", "devops engineer", "ui/ux designer", "ui designer", "ux designer", "system administrator",
    "quality assurance", "qa engineer", "business analyst", "project manager", "product manager", "scrum master"
]

ROLE_SKILLS_MAP = {
    "frontend": ["javascript", "react", "html", "css", "vue", "angular", "tailwind", "typescript", "figma"],
    "backend": ["node.js", "python", "java", "mongodb", "sql", "postgres", "docker", "redis", "express", "go", "c#"],
    "full stack": ["javascript", "react", "node.js", "mongodb", "express", "git", "html", "css", "docker", "typescript", "postgres"],
    "data": ["python", "r", "sql", "machine learning", "pandas", "numpy", "tensorflow", "tableau", "power bi"],
    "devops": ["docker", "kubernetes", "aws", "linux", "ci/cd", "jenkins", "terraform", "bash", "python"],
    "default": ["javascript", "python", "java", "sql", "git", "communication", "problem solving", "agile", "react", "node.js"]
}

# Set up PhraseMatcher
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
tech_patterns = [nlp.make_doc(text) for text in ALL_POSSIBLE_SKILLS]
soft_patterns = [nlp.make_doc(text) for text in SOFT_SKILLS]
matcher.add("TECH_SKILLS", tech_patterns)
matcher.add("SOFT_SKILLS", soft_patterns)


# --- NLTK Preprocessing ---
lemmatizer = WordNetLemmatizer()
try:
    stop_words = set(stopwords.words('english'))
except:
    stop_words = set()

def normalize_text(text):
    """
    NLTK preprocessing is used to normalize the extracted text through 
    tokenization, stopword removal, and lemmatization.
    """
    tokens = word_tokenize(text.lower())
    clean_tokens = [lemmatizer.lemmatize(w) for w in tokens if w not in stop_words and len(w) > 1]
    return " ".join(clean_tokens)


def extract_sections(text):
    """Rule-based Section Detection"""
    sections = {
        "contact": "",
        "experience": "",
        "education": "",
        "projects": "",
        "certifications": ""
    }
    
    # Simple regex-based section splitting
    lines = text.split("\n")
    current_section = "contact"
    
    for line in lines:
        lower_line = re.sub(r'[^a-z]', '', line.lower())
        if lower_line in ["experience", "workexperience", "employmenthistory", "professionalexperience", "jobexperience", "professionalbackground"]:
            current_section = "experience"
            continue
        elif lower_line in ["education", "academicbackground", "qualifications", "educationbackground"]:
            current_section = "education"
            continue
        elif lower_line in ["projects", "personalprojects", "academicprojects"]:
            current_section = "projects"
            continue
        elif lower_line in ["certifications", "licensescertifications", "licensesandcertifications"]:
            current_section = "certifications"
            continue
        elif lower_line in ["skills", "technicalskills", "corecompetencies"]:
            current_section = "skills" # we just ignore appending skills as text, use global text
            continue
            
        sections[current_section] += line + "\n"
        
    return sections

def extract_experience(exp_text, primary_role):
    """
    Experience Section -> Sentence Segmentation -> spaCy NER -> Rule-based association
    """
    experiences = []
    
    # Sentence Segmentation
    sentences = sent_tokenize(exp_text)
    
    current_exp = None
    
    for sent in sentences:
        doc = nlp(sent)
        
        org = None
        date = None
        
        # Extract ORG and DATE
        for ent in doc.ents:
            if ent.label_ == "ORG" and not org:
                org = ent.text
            elif ent.label_ == "DATE" and not date:
                # Basic validation for dates
                if bool(re.search(r'\d{4}', ent.text)):
                    date = ent.text
                    
        # Extract Role (from sentence or fallback)
        role = None
        lower_sent = sent.lower()
        for r in COMMON_ROLES:
            if r in lower_sent:
                role = r.title()
                break
                
        # Rule-based association
        if org or date or role:
            if not current_exp:
                current_exp = {
                    "company": org if org else "Unknown Company",
                    "jobTitle": role if role else (primary_role if primary_role else "Professional Role"),
                    "duration": date if date else "Unknown Duration",
                    "description": sent
                }
            else:
                # Update missing fields in current experience
                if org and current_exp["company"] == "Unknown Company":
                    current_exp["company"] = org
                if date and current_exp["duration"] == "Unknown Duration":
                    current_exp["duration"] = date
                if role and current_exp["jobTitle"] in ["Professional Role", primary_role]:
                    current_exp["jobTitle"] = role
                
                # If we already have org and date, and we see a new date, it might be a new experience
                if date and date != current_exp["duration"]:
                    experiences.append(current_exp)
                    current_exp = {
                        "company": org if org else current_exp["company"], # Sometimes same company
                        "jobTitle": role if role else current_exp["jobTitle"],
                        "duration": date,
                        "description": sent
                    }
                else:
                    current_exp["description"] += " " + sent
                    
    if current_exp:
        experiences.append(current_exp)
        
    if not experiences and exp_text.strip():
        experiences.append({
            "company": "Not Detected",
            "jobTitle": primary_role if primary_role else "Professional Role",
            "duration": "Unknown Duration",
            "description": exp_text.strip()
        })
        
    # Map duration to startDate and endDate for frontend compatibility
    for exp in experiences:
        parts = exp["duration"].split("to") if "to" in exp["duration"] else exp["duration"].split("-")
        exp["startDate"] = parts[0].strip() if len(parts) > 0 else exp["duration"]
        exp["endDate"] = parts[1].strip() if len(parts) > 1 else "Present"
        
    return experiences

def extract_education(edu_text):
    """
    Education Parsing: Locate Education section -> Extract Institution, Qualification, Graduation Year
    """
    educations = []
    sentences = sent_tokenize(edu_text)
    
    current_edu = None
    
    for sent in sentences:
        doc = nlp(sent)
        
        org = None
        date = None
        
        for ent in doc.ents:
            if ent.label_ == "ORG":
                org = ent.text
            elif ent.label_ == "DATE":
                if bool(re.search(r'\d{4}', ent.text)):
                    date = ent.text
                    
        # Extract Qualification using keywords
        qual = None
        lower_sent = sent.lower()
        if any(k in lower_sent for k in ["bachelor", "bsc", "b.sc", "b.a", "master", "msc", "phd", "degree", "diploma"]):
            qual_match = re.search(r'(bachelor|bsc|b\.sc|b\.a|master|msc|phd|degree|diploma)[^\.,;]*', lower_sent, re.IGNORECASE)
            if qual_match:
                qual = qual_match.group(0).title()
                
        if org or date or qual:
            if not current_edu:
                current_edu = {
                    "institution": org if org else "Unknown Institution",
                    "degree": qual if qual else "Detected Qualification",
                    "fieldOfStudy": "General",
                    "endYear": date if date else "Unknown Year"
                }
            else:
                if org and current_edu["institution"] == "Unknown Institution":
                    current_edu["institution"] = org
                if date and current_edu["endYear"] == "Unknown Year":
                    current_edu["endYear"] = date
                if qual and current_edu["degree"] == "Detected Qualification":
                    current_edu["degree"] = qual
                
                if date and date != current_edu["endYear"]:
                    educations.append(current_edu)
                    current_edu = {
                        "institution": org if org else current_edu["institution"],
                        "degree": qual if qual else "Detected Qualification",
                        "fieldOfStudy": "General",
                        "endYear": date
                    }
                    
    if current_edu:
        educations.append(current_edu)
        
    # Map endYear to startYear, endYear for frontend
    for edu in educations:
        edu["startYear"] = "Unknown"
        # If duration has -, split it
        if "-" in edu["endYear"] or "to" in edu["endYear"].lower():
            parts = re.split(r'-|to', edu["endYear"], flags=re.IGNORECASE)
            if len(parts) >= 2:
                edu["startYear"] = parts[0].strip()
                edu["endYear"] = parts[1].strip()

    return educations

@app.route('/analyze', methods=['POST'])
def analyze_cv():
    data = request.json
    text = data.get("text", "")
    target_role = data.get("targetRole", "Software Developer")
    
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # 1. Role Extraction (Header)
    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 0]
    
    EXTENDED_ROLES = COMMON_ROLES + ["associate software engineer", "senior software engineer", "tech lead", "architect", "data engineer", "intern", "trainee", "lead developer"]
    detected_role = "Unknown Role"
    role_line_index = -1
    
    # Since PDF parser might merge everything into one line, search only the first 500 characters (Header)
    # Pick the role that appears FIRST in the text to avoid picking up random roles mentioned later.
    header_text = text[:500]
    best_pos = 9999
    
    for role in EXTENDED_ROLES:
        match = re.search(rf'(?:^|\W)({role})(?:$|\W)', header_text, re.IGNORECASE)
        if match:
            pos = match.start()
            if pos < best_pos:
                best_pos = pos
                detected_role = role.title()
                
    # Fallback to the user-provided target_role if we couldn't find a standard role in the header
    if detected_role == "Unknown Role" and target_role:
        detected_role = target_role.title()
                
    # Still need role_line_index for Name extraction heuristic
    for i, line in enumerate(lines[:10]):
        if detected_role.lower() in line.lower():
            role_line_index = i
            break
            
    # Basic Contact Info (Extract these first so we can use email as fallback for name)
    email_match = re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', text)
    extracted_email = email_match.group(1) if email_match else ""
    phone_match = re.search(r'(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}', text)
    broad_phone = re.search(r'(?:(?:\+|00)\d{1,3})?[\s.-]*\(?\d{2,4}\)?(?:[\s.-]*\d){6,9}', text)
    if broad_phone:
        extracted_phone = broad_phone.group(0).strip()
    else:
        extracted_phone = phone_match.group(0).strip() if phone_match else ""
        
    # Address Extraction
    extracted_address = ""
    address_match = re.search(r'(?i)(?:no\.?|number)\s*\d+.*?(?:road|rd|street|st|lane|avenue|ave|mawatha|colombo|kandy|galle|gampaha|matara|kurunegala|sri lanka|\d{5})', text)
    if address_match:
        extracted_address = address_match.group(0)
    else:
        # Fallback for City, City (e.g. Induruwa, Bentota) anywhere in the text
        fallback_match = re.search(r'([A-Z][a-z]+(?:[ \-][A-Z][a-z]+)*,\s*[A-Z][a-z]+(?:[ \-][A-Z][a-z]+)*(?:,\s*Sri\sLanka)?)', text)
        if fallback_match:
            candidate = fallback_match.group(1).strip()
            # Avoid false positives
            if not any(w in candidate.lower() for w in ["skill", "experience", "education", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "monday", "tuesday", "wednesday"]):
                extracted_address = candidate
    
    # URL Extraction
    linkedin_match = re.search(r'((?:https?://)?(?:www\.)?linkedin\.com/[^\s]+)', text, re.IGNORECASE)
    github_match = re.search(r'((?:https?://)?(?:www\.)?github\.com/[^\s]+)', text, re.IGNORECASE)
    portfolio_match = re.search(r'(https?://(?:www\.)?(?!linkedin\.com|github\.com)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?)', text, re.IGNORECASE)
    
    extracted_linkedin = linkedin_match.group(1) if linkedin_match else ""
    extracted_github = github_match.group(1) if github_match else ""
    extracted_portfolio = portfolio_match.group(1) if portfolio_match else ""

    # Name extraction via spaCy (Try first 5 lines)
    extracted_name = ""
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
        
    # Heuristic: Name is usually right above the role (if found in top lines)
    if not extracted_name and 0 < role_line_index <= 3:
        candidate = lines[role_line_index - 1]
        if not re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', candidate) and not re.search(r'\d{7,}', candidate):
            extracted_name = candidate

    # Fallback heuristic: find the first line that is short and doesn't contain bad keywords
    if not extracted_name and len(lines) > 0:
        for line in lines[:5]:
            if 4 < len(line) < 40 and not re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', line) and not re.search(r'\d{7,}', line):
                if not any(k in line.lower() for k in ["profile", "summary", "skills", "objective", "curriculum vitae", "resume", "cv", "experience", "education"]):
                    extracted_name = line
                    break
                    
    # SAFEGUARD: Never allow a massive block of text to be the name
    if extracted_name and len(extracted_name) > 50:
        extracted_name = ""
        
    # Deep Search: If name is STILL not found (because PDF parser messed up the order), search the whole text
    if not extracted_name:
        doc = nlp(text[:1000]) # Search first 1000 chars to avoid memory issues
        for ent in doc.ents:
            if ent.label_ == "PERSON" and len(ent.text.split()) > 1:
                extracted_name = ent.text
                break
                
    # Foolproof Fallback: Derive from email
    if not extracted_name and extracted_email:
        name_part = extracted_email.split('@')[0]
        name_part = re.sub(r'[0-9]+', '', name_part)
        extracted_name = name_part.replace('.', ' ').replace('_', ' ').title()
        
    if not extracted_name:
        extracted_name = "Candidate Name"

    # 2. Section Parsing
    sections = extract_sections(text)
    
    # 3. NLTK Text Normalization
    normalized_text = normalize_text(text)
    
    # 4. PhraseMatcher for Skills
    doc_norm = nlp(normalized_text)
    matches = matcher(doc_norm)
    
    found_tech_skills = set()
    found_soft_skills = set()
    
    for match_id, start, end in matches:
        string_id = nlp.vocab.strings[match_id]
        span = doc_norm[start:end]
        if string_id == "TECH_SKILLS":
            found_tech_skills.add(span.text)
        elif string_id == "SOFT_SKILLS":
            found_soft_skills.add(span.text)
            
    tech_skills_list = list(found_tech_skills)
    soft_skills_list = list(found_soft_skills)

    # 5. Experience and Education Parsing
    dynamic_experience = extract_experience(sections["experience"], detected_role)
    dynamic_education = extract_education(sections["education"])
    
    # Gap Analysis
    lower_role = target_role.lower()
    matched_key = next((k for k in ROLE_SKILLS_MAP if k in lower_role), "default")
    required_skills = ROLE_SKILLS_MAP[matched_key]
    
    # Attempt SkillNovaAI Analysis First
    ai_result = None
    if skillnova_ai_engine.is_available():
        all_nlp_skills = tech_skills_list + soft_skills_list
        ai_result = skillnova_ai_engine.analyze_cv(
            target_role=target_role,
            candidate_name=extracted_name,
            extracted_skills=all_nlp_skills,
            clean_text=normalized_text
        )

    if ai_result:
        # Success with AI
        final_skills = ai_result.get("skills", tech_skills_list + soft_skills_list)
        missing_skills = ai_result.get("missingSkills", [])
        match_percentage = ai_result.get("matchPercentage", 0)
        ai_summary = ai_result.get("summary", "Analysis Complete using SkillNova AI.")
        growth_plan = ai_result.get("growthPlan", [])
    else:
        # Fallback to deterministic NLP logic
        missing_skills = [s for s in required_skills if s not in tech_skills_list]
        matched_skills = [s for s in required_skills if s in tech_skills_list]
        
        match_percentage = 0
        if required_skills and len(tech_skills_list) > 0:
            match_percentage = math.floor((len(matched_skills) / len(required_skills)) * 100)
        if len(tech_skills_list) >= 5 and match_percentage < 65:
            match_percentage = min(85, match_percentage + 25)
            
        final_skills = tech_skills_list + soft_skills_list
        ai_summary = "NLP Analysis Complete using NLTK and spaCy (Fallback Mode)."
        growth_plan = []

    is_it_related = len(tech_skills_list) > 0
    
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
        "professionalSummary": f"Professional detected as {detected_role}.",
        "primaryRole": { "role": detected_role, "confidence": 95, "reason": "Detected in header." },
        "technicalSkills": [s.title() for s in tech_skills_list],
        "softSkills": [s.title() for s in soft_skills_list],
        "skills": final_skills,
        "missingSkills": [s.title() for s in missing_skills],
        "education": dynamic_education,
        "experience": dynamic_experience,
        "projects": [],
        "certifications": [],
        "matchPercentage": match_percentage,
        "careerReadinessScore": match_percentage if is_it_related else 0,
        "jobRecommendations": [target_role] if is_it_related else [],
        "summary": ai_summary,
        "growthPlan": growth_plan
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
