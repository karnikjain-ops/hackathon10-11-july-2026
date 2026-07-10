import asyncio
from database import get_database
from models import HospitalModel, AmbulanceModel

async def seed():
    db = get_database()
    
    # Clear existing data for fresh seeding
    await db.hospitals.drop()
    await db.ambulances.drop()
    await db.emergencies.drop()
    
    print("Seeding hospitals...")
    # Insert fake hospitals in New Delhi
    hospitals = [
        {
            "name": "AIIMS New Delhi",
            "location": {"lat": 28.5659, "lng": 77.2011},
            "address": "Ansari Nagar, New Delhi, Delhi 110029, India",
            "total_icu_beds": 50,
            "available_icu_beds": 12,
            "specialties": ["Trauma", "Cardiac", "Neurology"]
        },
        {
            "name": "Safdarjung Hospital",
            "location": {"lat": 28.5681, "lng": 77.2062},
            "address": "Ansari Nagar East, New Delhi, Delhi 110029, India",
            "total_icu_beds": 30,
            "available_icu_beds": 5,
            "specialties": ["General", "Burns", "Orthopedics"]
        },
        {
            "name": "Sir Ganga Ram Hospital",
            "location": {"lat": 28.6387, "lng": 77.1895},
            "address": "Sarhadi Gandhi Marg, Old Rajinder Nagar, New Delhi, Delhi 110060, India",
            "total_icu_beds": 40,
            "available_icu_beds": 8,
            "specialties": ["Cardiac", "Pediatrics"]
        }
    ]
    await db.hospitals.insert_many(hospitals)
    
    print("Seeding ambulances...")
    # Insert fake ambulances around New Delhi
    ambulances = [
        {
            "location": {"lat": 28.6139, "lng": 77.2090}, # Connaught Place
            "status": "AVAILABLE",
            "equipment": ["Defibrillator", "Oxygen"],
            "paramedic_contact": "9876543210",
            "driver_name": "Ramesh Kumar"
        },
        {
            "location": {"lat": 28.5562, "lng": 77.1000}, # Airport area
            "status": "AVAILABLE",
            "equipment": ["Oxygen", "Trauma Kit"],
            "paramedic_contact": "9876543211",
            "driver_name": "Suresh Singh"
        },
        {
            "location": {"lat": 28.7041, "lng": 77.1025}, # North Delhi
            "status": "AVAILABLE",
            "equipment": ["Defibrillator", "Ventilator"],
            "paramedic_contact": "9876543212",
            "driver_name": "Amit Sharma"
        }
    ]
    await db.ambulances.insert_many(ambulances)
    
    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
