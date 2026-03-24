import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# db_url = "postgresql://postgres:postgresaks@localhost:5432/govlink"
db_url = os.getenv("DATABASE_URL")

engine = create_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
