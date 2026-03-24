from pydantic import BaseModel
from fastapi import Depends, FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database_models
from database import SessionLocal, engine
from models import Issue
from classifier import classify_issue
import os, shutil, uuid
from typing import List
from classifier import classify_issue, calculate_urgency

  

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

database_models.Base.metadata.create_all(bind=engine)

@app.get("/api/timeline")
def get_timeline():
    return []



database_models.Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/issues")
def get_issues(db: Session = Depends(get_db)):
    issues = db.query(database_models.Issue).all()
    return issues

@app.post("/api/issues")
def add_issue(issue: Issue, db: Session = Depends(get_db)):

    # classify issue using HuggingFace model
    issue_type = classify_issue(issue.description)
    urgency_score = calculate_urgency(issue.description)

    new_issue = database_models.Issue(
        description=issue.description,
        type=issue_type,   # ✅ USE THE CLASSIFIER RESULT
        location_name=issue.location_name,
        lat=issue.lat,
        lng=issue.lng,
        status="PENDING",
        urgency=urgency_score,
        upvotes= 0,
        image_paths=issue.image_paths
    )

    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)

    return new_issue

# -------------------------
# ADMIN ROUTES (ADD BELOW)
# -------------------------

# 🔹 Get all issues for admin
@app.get("/admin/issues")
def get_admin_issues(db: Session = Depends(get_db)):
    return db.query(database_models.Issue).order_by(database_models.Issue.id.desc()).all()


# 🔹 Verify issue
@app.patch("/admin/issues/{issue_id}/verify")
def verify_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(database_models.Issue).filter(database_models.Issue.id == issue_id).first()

    if not issue:
        return {"error": "Issue not found"}

    issue.status = "VERIFIED"
    db.commit()
    db.refresh(issue)

    return {"message": "Issue verified"}


# 🔹 Reject issue
@app.delete("/admin/issues/{issue_id}")
def reject_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(database_models.Issue).filter(database_models.Issue.id == issue_id).first()

    if not issue:
        return {"error": "Issue not found"}

    db.delete(issue)
    db.commit()

    return {"message": "Issue deleted"}


# 🔹 Forward model
class ForwardRequest(BaseModel):
    department: str
    priority: str
    message: str = None


# 🔹 Forward issue
@app.patch("/admin/issues/{issue_id}/forward")
def forward_issue(issue_id: int, data: ForwardRequest, db: Session = Depends(get_db)):
    issue = db.query(database_models.Issue).filter(database_models.Issue.id == issue_id).first()

    if not issue:
        return {"error": "Issue not found"}

    issue.status = "FORWARDED"

    db.commit()
    db.refresh(issue)

    return {"message": "Issue forwarded"}

    # 🔹 Resolve issue — 100% complete, problem fully fixed
@app.patch("/admin/issues/{issue_id}/resolve")
def resolve_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(database_models.Issue).filter(database_models.Issue.id == issue_id).first()
 
    if not issue:
        return {"error": "Issue not found"}
 
    issue.status = "RESOLVED"
    db.commit()
    db.refresh(issue)
 
    return {"message": "Issue resolved"}

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    saved_paths = []
    for file in files:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        dest = os.path.join(UPLOAD_DIR, filename)
        with open(dest, "wb") as f:
            shutil.copyfileobj(file.file, f)
        saved_paths.append(dest)
    return {"paths": saved_paths}
