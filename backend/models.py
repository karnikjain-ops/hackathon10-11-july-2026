from pydantic import BaseModel, Field, ConfigDict
from pydantic_core import core_schema
from typing import Optional, List, Any
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: Any,
    ) -> core_schema.CoreSchema:
        return core_schema.union_schema(
            [
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema(
                    [
                        core_schema.str_schema(),
                        core_schema.no_info_plain_validator_function(cls.validate),
                    ]
                ),
            ]
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

class Location(BaseModel):
    lat: float
    lng: float

class PatientModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

class HospitalModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    password: str = Field(default="password123")
    location: Location
    address: Optional[str] = None
    total_icu_beds: int
    available_icu_beds: int
    specialties: List[str] = []

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

class AmbulanceModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    password: str = Field(default="password123")
    status: str = Field(..., description="AVAILABLE, EN_ROUTE, TRANSPORTING")
    location: Location
    paramedic_contact: str = Field(default="9876543210")
    driver_name: str = Field(default="Unknown Driver")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

class EmergencyModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    patient_id: Optional[PyObjectId] = None
    patient_name: str
    symptoms: str
    patient_profile: Optional[dict] = Field(default={}, description="Snapshot of allergies, blood_type, conditions")
    priority: int = Field(default=0, description="1 to 5, 1 being highest priority")
    location: Location
    address: Optional[str] = None
    assigned_ambulance_id: Optional[PyObjectId] = None
    target_hospital_id: Optional[PyObjectId] = None
    pending_hospital_id: Optional[PyObjectId] = None
    rejected_hospital_ids: List[PyObjectId] = []
    eta: Optional[int] = None
    first_aid_instructions: Optional[str] = None
    route_path: Optional[List[List[float]]] = None
    status: str = Field(default="PENDING_HOSPITAL_ACCEPTANCE", description="PENDING_HOSPITAL_ACCEPTANCE, EN_ROUTE_TO_HOSPITAL, RESOLVED")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )
