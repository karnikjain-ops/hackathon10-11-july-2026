import re

def analyze_symptoms_and_prioritize(symptoms: str) -> int:
    """
    Mock AI Service for Hackathon MVP.
    Analyzes the text of the symptoms and assigns a priority from 1 (Critical) to 5 (Minor).
    If we get a real Gemini API key later, we can replace this logic with an LLM call.
    """
    symptoms_lower = symptoms.lower()

    # Priority 1: Life-threatening
    p1_keywords = ["heart", "cardiac", "breathing", "unconscious", "stroke", "gunshot", "severe bleeding", "no pulse"]
    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in p1_keywords):
        return 1

    # Priority 2: Emergent, but not immediately life-threatening
    p2_keywords = ["chest pain", "severe pain", "burns", "fracture", "head injury", "overdose"]
    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in p2_keywords):
        return 2

    # Priority 3: Urgent
    p3_keywords = ["bleeding", "broken", "allergic", "asthma", "seizure", "abdominal pain"]
    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in p3_keywords):
        return 3

    # Priority 4: Less Urgent
    p4_keywords = ["fever", "sprain", "cut", "vomiting", "dizzy", "infection"]
    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in p4_keywords):
        return 4

    # Priority 5: Minor (Default if no keywords match)
    return 5
