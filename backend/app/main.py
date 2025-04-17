
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
import bcrypt
from typing import List

# Database setup
DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Define User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

# Define User Progress model
class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    completed_letters = Column(String, default="")  # Store as comma-separated values

# Add this to your models in the backend
class LetterAccuracy(Base):
    __tablename__ = "letter_accuracy"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    letter = Column(String, index=True)
    accuracy = Column(Integer)  # Or Float if you want more precision

# Create the database tables
Base.metadata.create_all(bind=engine)

# FastAPI app initialization
app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class LoginData(BaseModel):
    email: str
    password: str

class UpdateProgressRequest(BaseModel):
    user_id: int
    completed_letters: List[str]

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Signup endpoint
@app.post("/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Hash the password securely
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt(rounds=12))
    
    # Create a new user
    db_user = User(username=user.username, email=user.email, password=hashed_password.decode('utf-8'))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {"message": "Account created successfully"}

# Login endpoint
@app.post("/login")
async def login(data: LoginData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not bcrypt.checkpw(data.password.encode('utf-8'), user.password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Incorrect password")

    return {"message": "Login successful!"}

# Get all users (for debugging)
@app.get("/users")
async def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# Update user progress
@app.post("/update-progress/")
async def update_progress(progress: UpdateProgressRequest, db: Session = Depends(get_db)):
    if not progress.user_id:
        return {"error": "User ID is required"}

    user_progress = db.query(UserProgress).filter(UserProgress.user_id == progress.user_id).first()
    
    if user_progress:
        current_letters = user_progress.completed_letters.split(",") if user_progress.completed_letters else []
        new_letters = set(current_letters + progress.completed_letters)
        user_progress.completed_letters = ",".join(sorted(new_letters))  
        db.commit()
    else:
        new_progress = UserProgress(user_id=progress.user_id, completed_letters=",".join(progress.completed_letters))
        db.add(new_progress)
        db.commit()
        db.refresh(new_progress)

    return {"message": f"Progress updated successfully for user {progress.user_id}"}

# Get user ID by email
@app.get("/get-user-id/{email}")
async def get_user_id(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user.id}

# Get user progress
@app.get("/get-progress/{user_id}")
async def get_progress(user_id: int, db: Session = Depends(get_db)):
    if not isinstance(user_id, int):  
        raise HTTPException(status_code=400, detail="Invalid user_id")

    user_progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not user_progress:
        return {"completed_letters": []}

    return {"completed_letters": user_progress.completed_letters.split(",")}

class LetterAccuracyData(BaseModel):
    user_id: int
    letter: str
    accuracy: int  # or float
@app.post("/submit-accuracy/")
async def submit_accuracy(data: LetterAccuracyData, db: Session = Depends(get_db)):
    existing = db.query(LetterAccuracy).filter(
        LetterAccuracy.user_id == data.user_id,
        LetterAccuracy.letter == data.letter
    ).first()
    print(data.user_id)
    if existing:
        existing.accuracy = data.accuracy  # Overwrite
    else:
        entry = LetterAccuracy(
            user_id=data.user_id,
            letter=data.letter,
            accuracy=data.accuracy
        )
        db.add(entry)

    db.commit()
    return {"message": "Accuracy saved successfully."}

# @app.post("/submit-accuracy/")
# async def submit_accuracy(data: LetterAccuracyData, db: Session = Depends(get_db)):
#     print("✔️ Received data:", data)

@app.get("/get-letter-accuracies/{user_id}")
async def get_letter_accuracies(user_id: int, db: Session = Depends(get_db)):
    results = db.query(LetterAccuracy).filter(LetterAccuracy.user_id == user_id).all()
    return [{"letter": r.letter, "accuracy": r.accuracy} for r in results]
