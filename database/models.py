from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"

engine = create_engine(DB_URL)
Base = declarative_base()
Session = sessionmaker(bind=engine)

class Breach(Base):
    __tablename__ = 'breaches'
    id           = Column(Integer, primary_key=True)
    source       = Column(String(100))
    email        = Column(String(200))
    domain       = Column(String(100))
    data_found   = Column(Text)
    threat_score = Column(Integer)
    hash_id      = Column(String(64), unique=True)
    found_at     = Column(DateTime, default=datetime.utcnow)
    alerted      = Column(String(10), default='No')

def create_tables():
    Base.metadata.create_all(engine)
    print("✅ Database tables created!")

if __name__ == "__main__":
    create_tables()
