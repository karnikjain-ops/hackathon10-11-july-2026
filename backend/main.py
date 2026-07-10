from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from database import get_database
from models import HospitalModel, AmbulanceModel, EmergencyModel
from typing import List

app = FastAPI(title="Emergency Healthcare API")

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = get_database()

@app.get("/")
async def root():
    return {"message": "Welcome to the Emergency Healthcare API"}

@app.get("/hospitals", response_model=List[HospitalModel])
async def get_hospitals():
    hospitals = []
    cursor = db.hospitals.find({})
    async for document in cursor:
        hospitals.append(HospitalModel(**document))
    return hospitals

@app.get("/ambulances", response_model=List[AmbulanceModel])
async def get_ambulances():
    ambulances = []
    cursor = db.ambulances.find({})
    async for document in cursor:
        ambulances.append(AmbulanceModel(**document))
    return ambulances

@app.get("/emergencies", response_model=List[EmergencyModel])
async def get_emergencies():
    emergencies = []
    cursor = db.emergencies.find({})
    async for document in cursor:
        emergencies.append(EmergencyModel(**document))
    return emergencies

from ai_service import analyze_symptoms_and_prioritize

@app.post("/emergencies", response_model=EmergencyModel)
async def create_emergency(emergency: EmergencyModel = Body(...)):
    # 1. Use the AI service to determine the priority based on symptoms
    determined_priority = analyze_symptoms_and_prioritize(emergency.symptoms)
    emergency.priority = determined_priority
    
    # 2. Save to database
    new_emergency = await db.emergencies.insert_one(emergency.model_dump(by_alias=True, exclude={"id"}))
    created_emergency = await db.emergencies.find_one({"_id": new_emergency.inserted_id})
    return created_emergency
