@echo off
echo Starting AI Recommendation Microservice...
cd /d "%~dp0"
call venv\Scripts\activate.bat
uvicorn main:app --port 8000 --reload
