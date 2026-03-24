# import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

db_url = "postgresql://postgres:postgresaks@localhost:5432/govlink"
# db_url = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_Ags6e1QcdxZI@ep-wispy-darkness-a1gxy1xt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

engine = create_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()