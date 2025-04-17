from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    username: str
    email: str
    password: str

class UserInDB(User):
    hashed_password: str

class Login(BaseModel):
    email: str
    password: str

# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy import Column, Integer, String, ForeignKey

# Base = declarative_base()
# class UserProgress(Base):
#     __tablename__ = "user_progress"
#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"), unique=True)
#     completed_letters = Column(String, default="")  # Store as comma-separated values
