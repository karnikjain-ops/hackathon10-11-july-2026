import asyncio
from database import get_database
from models import HospitalModel, AmbulanceModel

async def seed():
    db = get_database()
    
    # Clear existing data for fresh seeding
    await db.hospitals.drop()
    await db.ambulances.drop()
    await db.emergencies.drop()

    hospitals_data = [
        {
            "name": "City General Hospital",
            "location": {"lat": 40.7128, "lng": -74.0060},
            "total_icu_beds": 20,
            "available_icu_beds": 5,
            "resources": ["Trauma Center", "Cardiac Unit"]
        },
        {
            "name": "Northside Medical Center",
            "location": {"lat": 40.7589, "lng": -73.9851},
            "total_icu_beds": 10,
            "available_icu_beds": 2,
            "resources": ["Stroke Center"]
        }
    ]

    ambulances_data = [
        {
            "status": "AVAILABLE",
            "location": {"lat": 40.7306, "lng": -73.9866},
            "paramedic_contact": "555-0101"
        },
        {
            "status": "AVAILABLE",
            "location": {"lat": 40.7488, "lng": -73.9680},
            "paramedic_contact": "555-0102"
        }
    ]

    print("Seeding hospitals...")
    for h in hospitals_data:
        await db.hospitals.insert_one(h)

    print("Seeding ambulances...")
    for a in ambulances_data:
        await db.ambulances.insert_one(a)

    print("Seed complete!")

if __name__ == "__main__":
    asyncio.run(seed())
