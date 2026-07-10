import re
from typing import Dict, Any

def analyze_symptoms_and_prioritize(symptoms: str) -> Dict[str, Any]:
    """
    Mock AI Service for Hackathon MVP.
    Analyzes the text of the symptoms and assigns a priority from 1 (Critical) to 5 (Minor).
    Also provides contextual first-aid instructions.
    """
    symptoms_lower = symptoms.lower()

    # Priority 1: Life-threatening
    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in ["heart", "cardiac", "stroke"]):
        return {"priority": 1, "instructions": "Keep the patient calm and seated. Do not give them anything to eat or drink. If they have prescribed nitroglycerin, assist them with it. Be prepared to start CPR if they become unresponsive."}
    
    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in ["breathing", "asthma", "choking"]):
        return {"priority": 1, "instructions": "Help the patient into a comfortable sitting position. If they have an inhaler, help them use it. Encourage slow, deep breaths."}
    
    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in ["severe bleeding", "gunshot", "stab"]):
        return {"priority": 1, "instructions": "Apply direct, firm pressure to the wound with a clean cloth. Do not remove the cloth if it soaks through; add more layers on top."}

    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in ["unconscious", "no pulse"]):
        return {"priority": 1, "instructions": "Check for breathing. If no breathing, begin CPR immediately (push hard and fast in the center of the chest)."}

    # Priority 2: Emergent
    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in ["burns"]):
        return {"priority": 2, "instructions": "Cool the burn under cool (not cold) running water for at least 10 minutes. Do not apply ice, butter, or ointments. Cover lightly with a clean, dry dressing."}
        
    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in ["fracture", "broken"]):
        return {"priority": 2, "instructions": "Keep the injured area completely still. Do not attempt to realign the bone. Apply ice wrapped in a cloth to reduce swelling."}

    # Priority 3: Urgent
    if any(re.search(rf"\b{kw}\b", symptoms_lower) for kw in ["allergic", "seizure"]):
        return {"priority": 3, "instructions": "For allergies: use an EpiPen if available. For seizures: clear the area of hard objects, cushion their head, and do not put anything in their mouth."}

    # Default
    return {"priority": 5, "instructions": "Stay calm and wait for the ambulance. Do not move the patient unless they are in immediate physical danger."}
