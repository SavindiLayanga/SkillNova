import sys
import os

sys.path.append(os.path.dirname(__file__))
from app import extract_sections, extract_experience

text = """
B U D D H I N I H A R S H I K A
I T U N D E R G R A D U A T E
W O R K E X P E R I E N C E
Quality Assurance Intern
Bank of Ceylon, Head Office
(2025 - 2026)
Performed manual testing
"""

sections = extract_sections(text)
print("SECTIONS:")
for k, v in sections.items():
    if v.strip():
        print(f"[{k}]", repr(v))

exp = extract_experience(sections["experience"], "Software Developer")
print("EXPERIENCE:")
print(exp)
