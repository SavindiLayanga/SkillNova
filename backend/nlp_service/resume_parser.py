import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables (like GROQ_API_KEY)
load_dotenv()

class SkillNovaAI:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        # We only initialize the client if the key is available, to allow fallbacks
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        
        # We can use Llama-3-8b for faster responses, or Llama-3-70b for deeper reasoning
        self.model = "llama3-8b-8192" 

    def is_available(self):
        return self.client is not None

    def analyze_cv(self, target_role, candidate_name, extracted_skills, clean_text):
        """
        Sends the pre-processed CV text and context to the LLM and 
        requests a structured JSON response for skill gap and growth plan.
        """
        if not self.is_available():
            raise Exception("Groq API key not found. SkillNovaAI requires GROQ_API_KEY in .env")

        prompt = f"""
        You are the 'SkillNovaAI' career coach engine. 
        Your task is to analyze a candidate's CV against a target job role and provide a structured JSON response.

        Target Role: {target_role}
        Candidate Name: {candidate_name}
        Skills found by NLP module: {', '.join(extracted_skills) if extracted_skills else 'None detected explicitly'}
        
        CV Text (Cleaned):
        {clean_text}

        Based on the CV Text and Target Role, provide the following JSON structure exactly:
        {{
            "skills": ["List of all valid technical and soft skills actually present in the CV"],
            "missingSkills": ["List of 3 to 5 critical skills required for the Target Role that are MISSING from the CV"],
            "matchPercentage": <Integer between 0 and 100 representing how well the CV matches the role>,
            "summary": "<A 2-sentence summary of the candidate's profile and readiness for the role>",
            "growthPlan": [
                {{
                    "step": 1,
                    "title": "<Actionable step to acquire a missing skill>",
                    "description": "<Brief detail on how to achieve this>"
                }},
                {{
                    "step": 2,
                    "title": "<Another actionable step>",
                    "description": "<Brief detail>"
                }}
            ]
        }}

        IMPORTANT: Return ONLY valid JSON. Do not include markdown formatting (like ```json). Do not include any conversational text.
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a precise JSON-generating career analysis AI. You must output raw valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                temperature=0.3, # Low temperature for more deterministic output
            )

            response_content = chat_completion.choices[0].message.content.strip()
            
            # Clean up potential markdown formatting from the AI response
            if response_content.startswith("```json"):
                response_content = response_content[7:]
            if response_content.startswith("```"):
                response_content = response_content[3:]
            if response_content.endswith("```"):
                response_content = response_content[:-3]
                
            response_content = response_content.strip()
            
            # Parse JSON
            result = json.loads(response_content)
            return result

        except Exception as e:
            print(f"SkillNovaAI Error: {e}")
            return None
