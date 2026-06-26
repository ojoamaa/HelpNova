from pydantic import BaseModel


class JobPhotoCreate(BaseModel):
    photo_url: str
    photo_type: str
