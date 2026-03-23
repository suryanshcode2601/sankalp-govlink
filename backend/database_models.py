from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base


class Issue(Base):

    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)

    description = Column(String, nullable=False)

    type = Column(String, default="General")

    status = Column(String, default="PENDING")

    location_name = Column(String, default="Unknown")

    lat = Column(Float)

    lng = Column(Float)

    urgency = Column(Integer, default=50)

    upvotes = Column(Integer, default=0)

    reported_at = Column(DateTime, default=datetime.utcnow)

    image_paths = Column(String, default="")