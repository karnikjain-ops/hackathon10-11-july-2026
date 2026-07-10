import requests
res = requests.post("http://127.0.0.1:8000/emergencies", json={
    "patient_id": "668ed534351a92e1f40d87fa",
    "patient_name": "Test",
    "symptoms": "Chest pain",
    "patient_profile": {"allergies": []},
    "location": {
        "lat": 40.7,
        "lng": -74.0
    }
})
print(res.status_code)
print(res.text)
