from fastapi import FastAPI, HTTPException, Body, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import get_database
from models import HospitalModel, AmbulanceModel, EmergencyModel, PatientModel
from typing import List
from bson import ObjectId
import asyncio
from fastapi import BackgroundTasks
import httpx
import math
import jwt
from datetime import datetime, timedelta
from ai_service import analyze_symptoms_and_prioritize

app = FastAPI(title="Emergency Healthcare API")

# JWT Config
SECRET_KEY = "HACKATHON_SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/login")
async def login(payload: dict = Body(...)):
    role = payload.get("role")
    entity_id = payload.get("id")
    password = payload.get("password")
    
    if role == "HOSPITAL":
        entity = await db.hospitals.find_one({"_id": ObjectId(entity_id)})
        if not entity or entity.get("password", "password123") != password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        token = create_access_token({"sub": str(entity_id), "role": "HOSPITAL"})
        return {"access_token": token, "token_type": "bearer", "hospital": HospitalModel(**entity).model_dump()}
        
    elif role == "AMBULANCE":
        entity = await db.ambulances.find_one({"_id": ObjectId(entity_id)})
        if not entity or entity.get("password", "password123") != password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        token = create_access_token({"sub": str(entity_id), "role": "AMBULANCE"})
        return {"access_token": token, "token_type": "bearer", "ambulance": AmbulanceModel(**entity).model_dump()}
        
    raise HTTPException(status_code=400, detail="Invalid role")

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = get_database()

# WebSocket Connection Manager for Admin Logs
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

async def log_event(message: str):
    await manager.broadcast(message)

@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "Welcome to the Emergency Healthcare API"}

from models import PatientModel

@app.post("/patients", response_model=PatientModel)
async def create_patient(patient: PatientModel = Body(...)):
    new_patient = await db.patients.insert_one(patient.model_dump(by_alias=True, exclude={"id"}))
    created = await db.patients.find_one({"_id": new_patient.inserted_id})
    return created

@app.get("/patients/{id}", response_model=PatientModel)
async def get_patient(id: str):
    patient = await db.patients.find_one({"_id": ObjectId(id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.get("/hospitals", response_model=List[HospitalModel])
async def get_hospitals():
    hospitals = []
    cursor = db.hospitals.find({})
    async for document in cursor:
        hospitals.append(HospitalModel(**document))
    return hospitals

@app.post("/hospitals", response_model=HospitalModel)
async def create_hospital(hospital: HospitalModel = Body(...)):
    new_hospital = await db.hospitals.insert_one(hospital.model_dump(by_alias=True, exclude={"id"}))
    created_hospital = await db.hospitals.find_one({"_id": new_hospital.inserted_id})
    return created_hospital

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

async def get_address_from_coords(lat: float, lng: float) -> str:
    try:
        headers = {"User-Agent": "EmergencyHealthcareHackathonApp/1.0"}
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json",
                headers=headers,
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("display_name", f"{lat}, {lng}")
    except Exception as e:
        print(f"Geocoding error: {e}")
    return f"{lat}, {lng}"

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def get_osrm_route(lat1, lon1, lat2, lon2):
    # Note: OSRM uses lon,lat order
    try:
        url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson"
        async with httpx.AsyncClient() as client:
            res = await client.get(url, timeout=5.0)
            if res.status_code == 200:
                data = res.json()
                if data.get("routes") and len(data["routes"]) > 0:
                    route = data["routes"][0]
                    duration_sec = route.get("duration", 0)
                    geometry = route.get("geometry", {})
                    coordinates = geometry.get("coordinates", [])
                    # convert [lon, lat] to [lat, lon] for Leaflet
                    path = [[p[1], p[0]] for p in coordinates]
                    return max(int(duration_sec), 30), path
    except Exception as e:
        print("OSRM error:", e)
    
    # Fallback to straight line Haversine
    dist = calculate_distance_km(lat1, lon1, lat2, lon2)
    return max(int(dist * 60), 30), [[lat1, lon1], [lat2, lon2]]

@app.post("/emergencies", response_model=EmergencyModel)
async def create_emergency(emergency: EmergencyModel = Body(...)):
    # 1. AI triage
    ai_result = analyze_symptoms_and_prioritize(emergency.symptoms)
    emergency.priority = ai_result["priority"]
    emergency.first_aid_instructions = ai_result["instructions"]
    
    # 2. Reverse Geocoding
    emergency.address = await get_address_from_coords(emergency.location.lat, emergency.location.lng)
    
    # 3. Find closest hospital with beds
    hospitals = []
    async for h in db.hospitals.find({"available_icu_beds": {"$gt": 0}}):
        dist = calculate_distance_km(emergency.location.lat, emergency.location.lng, h["location"]["lat"], h["location"]["lng"])
        hospitals.append((dist, h))
    
    if hospitals:
        # Sort by aerial distance first
        hospitals.sort(key=lambda x: x[0])
        # Take top 3 for OSRM API real driving check
        top_candidates = hospitals[:3]
        
        best_hospital_id = None
        best_duration = float('inf')
        
        await log_event(f"[TRIAGE] Fetching live OSRM driving routes for top {len(top_candidates)} nearest hospitals...")
        
        for dist, h in top_candidates:
            eta, path = await get_osrm_route(
                emergency.location.lat, emergency.location.lng,
                h["location"]["lat"], h["location"]["lng"]
            )
            if eta and eta < best_duration:
                best_duration = eta
                best_hospital_id = h["_id"]
                
        # Fallback to aerial if OSRM failed
        if not best_hospital_id:
            best_hospital_id = top_candidates[0][1]["_id"]
            
        emergency.pending_hospital_id = best_hospital_id
        emergency.status = "PENDING_HOSPITAL_ACCEPTANCE"
        await log_event(f"[TRIAGE] Triage complete! Routing SOS to Hospital ID: {best_hospital_id}")
    else:
        emergency.status = "NO_HOSPITALS_AVAILABLE"
        await log_event(f"[TRIAGE] Alert: No available hospitals found for SOS from {emergency.patient_name}.")
    
    # 4. Save
    new_emergency = await db.emergencies.insert_one(emergency.model_dump(by_alias=True, exclude={"id"}))
    created_emergency = await db.emergencies.find_one({"_id": new_emergency.inserted_id})
    await log_event(f"[API] 201 Created: New Emergency SOS Received (ID: {created_emergency['_id']})")
    return created_emergency

@app.put("/ambulances/{id}/location")
async def update_ambulance_location(id: str, payload: dict = Body(...)):
    lat = payload.get("lat")
    lng = payload.get("lng")
    if lat is None or lng is None:
        raise HTTPException(status_code=400, detail="Missing lat or lng")
        
    await db.ambulances.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"location": {"lat": lat, "lng": lng}}}
    )
    return {"message": "Location updated"}

@app.put("/emergencies/{id}/hospital-response")
async def hospital_response(id: str, background_tasks: BackgroundTasks, payload: dict = Body(...)):
    action = payload.get("action")
    hospital_id_str = payload.get("hospital_id")
    
    emergency = await db.emergencies.find_one({"_id": ObjectId(id)})
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
        
    if action == "DENY":
        rejected = emergency.get("rejected_hospital_ids", [])
        rejected.append(ObjectId(hospital_id_str))
        
        # Find next nearest
        hospitals = []
        async for h in db.hospitals.find({"available_icu_beds": {"$gt": 0}}):
            if h["_id"] not in rejected:
                dist = calculate_distance_km(emergency["location"]["lat"], emergency["location"]["lng"], h["location"]["lat"], h["location"]["lng"])
                hospitals.append((dist, h["_id"]))
                
        if hospitals:
            hospitals.sort(key=lambda x: x[0])
            next_hospital_id = hospitals[0][1]
            await db.emergencies.update_one(
                {"_id": ObjectId(id)},
                {"$set": {"rejected_hospital_ids": rejected, "pending_hospital_id": next_hospital_id}}
            )
            await log_event(f"[ROUTING] Hospital {hospital_id_str} denied. Re-routed to {next_hospital_id}")
        else:
            await db.emergencies.update_one(
                {"_id": ObjectId(id)},
                {"$set": {"rejected_hospital_ids": rejected, "pending_hospital_id": None, "status": "NO_HOSPITALS_AVAILABLE"}}
            )
            
    elif action == "ACCEPT":
        hospital_id = ObjectId(hospital_id_str)
        ambulance = await db.ambulances.find_one({"status": "AVAILABLE"})
        ambulance_id = ambulance["_id"] if ambulance else None
        
        eta = None
        route_path = None
        if ambulance:
            eta, route_path = await get_osrm_route(
                ambulance["location"]["lat"], ambulance["location"]["lng"],
                emergency["location"]["lat"], emergency["location"]["lng"]
            )
            
        update_data = {
            "status": "EN_ROUTE_TO_HOSPITAL",
            "target_hospital_id": hospital_id,
            "pending_hospital_id": None,
            "assigned_ambulance_id": ambulance_id,
            "eta": eta,
            "route_path": route_path
        }
        
        await db.emergencies.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        
        await db.hospitals.update_one(
            {"_id": hospital_id},
            {"$inc": {"available_icu_beds": -1}}
        )
        
        if ambulance_id:
            await db.ambulances.update_one(
                {"_id": ambulance_id},
                {"$set": {"status": "EN_ROUTE"}}
            )
            if route_path:
                await log_event(f"[OSRM] Fetched actual driving route. ETA: {eta}s")
                pass

    updated_emergency = await db.emergencies.find_one({"_id": ObjectId(id)})
    await log_event(f"[DISPATCH] Hospital accepted. Ambulance assigned to emergency {id}.")
    return EmergencyModel(**updated_emergency)

@app.put("/emergencies/{id}/resolve")
async def resolve_emergency(id: str):
    emergency = await db.emergencies.find_one({"_id": ObjectId(id)})
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
        
    # Update emergency status
    await db.emergencies.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": "RESOLVED"}}
    )
    
    # Free up the ambulance
    if emergency.get("assigned_ambulance_id"):
        await db.ambulances.update_one(
            {"_id": emergency["assigned_ambulance_id"]},
            {"$set": {"status": "AVAILABLE"}}
        )
        
    return {"message": "Emergency resolved and ambulance freed"}
