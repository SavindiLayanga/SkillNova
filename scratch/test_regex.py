import re

date_regex = r'(?<!\d)((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[a-z]*\s*\d{4})\s*(?:-|to|–)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[a-z]*\s*\d{4}|Present|Current|Now|Till Date)(?!\d)'

lines = [
    "Web Developer - Internship",
    "Studio MI (Pvt) Ltd 2025-2026",
    "Studio MI (Pvt) Ltd 2025 - 2026"
]

for line in lines:
    match = re.search(date_regex, line, re.IGNORECASE)
    print(f"'{line}' -> {match.groups() if match else 'NO MATCH'}")
