from fastapi import FastAPI, HTTPException
import mysql.connector
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from dotenv import load_dotenv

# Load .env from backend directory
env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Travel Booking AI Service")

@app.get("/")
def health_check():
    return {"status": "ok", "service": "AI Recommendation System V2"}

# Nạp router mới
from recommendation import router as recommend_router
app.include_router(recommend_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
