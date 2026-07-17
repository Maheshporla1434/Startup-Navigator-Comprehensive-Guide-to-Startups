from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models import Resource
from backend.app.schemas import ResourceResponse, ResourceCreate
from backend.app.api.auth import get_admin_user, get_current_user

router = APIRouter()

@router.get("", response_model=List[ResourceResponse])
def get_resources(type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Resource)
    if type:
        query = query.filter(Resource.type == type)
    return query.order_by(Resource.title.asc()).all()

@router.post("", response_model=ResourceResponse)
def create_resource(resource_in: ResourceCreate, db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    new_resource = Resource(**resource_in.dict())
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    return new_resource

@router.put("/{id}", response_model=ResourceResponse)
def update_resource(id: int, resource_in: ResourceCreate, db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    resource = db.query(Resource).filter(Resource.id == id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    for field, value in resource_in.dict().items():
        setattr(resource, field, value)
    db.commit()
    db.refresh(resource)
    return resource

@router.delete("/{id}")
def delete_resource(id: int, db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    resource = db.query(Resource).filter(Resource.id == id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    db.delete(resource)
    db.commit()
    return {"message": "Resource deleted successfully"}
