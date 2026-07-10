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

class HospitalModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    location: Location
    total_icu_beds: int
    available_icu_beds: int
    resources: List[str] = []

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

class AmbulanceModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    status: str = Field(..., description="AVAILABLE, EN_ROUTE, TRANSPORTING")
    location: Location
    paramedic_contact: str

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

class EmergencyModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    patient_name: str
    symptoms: str
    patient_profile: Optional[dict] = Field(default={}, description="Contains allergies, blood_type, conditions")
    priority: int = Field(default=0, description="1 to 5, 1 being highest priority")
    location: Location
    assigned_ambulance_id: Optional[PyObjectId] = None
    target_hospital_id: Optional[PyObjectId] = None
    status: str = Field(default="PENDING", description="PENDING, ASSIGNED, EN_ROUTE_TO_HOSPITAL, RESOLVED")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )
