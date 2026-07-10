import requests

API_URL = "http://127.0.0.1:8000/emergencies"

emergencies_to_test = [
    {
        "patient_name": "John Doe",
        "symptoms": "Severe chest pain and difficulty breathing.",
        "location": {"lat": 40.7306, "lng": -73.9866}
    },
    {
        "patient_name": "Jane Smith",
        "symptoms": "Sprained ankle while jogging.",
        "location": {"lat": 40.7128, "lng": -74.0060}
    },
    {
        "patient_name": "Mike Johnson",
        "symptoms": "High fever and vomiting for 2 days.",
        "location": {"lat": 40.7589, "lng": -73.9851}
    }
]

for e in emergencies_to_test:
    response = requests.post(API_URL, json=e)
    if response.status_code == 200:
        data = response.json()
        print(f"Patient: {data['patient_name']} | Symptoms: '{data['symptoms']}' | Assigned Priority: {data['priority']}")
    else:
        print(f"Failed to submit: {response.status_code} - {response.text}")
