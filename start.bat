@echo off
cd /d "%~dp0"
echo Starting your site at http://localhost:8000  (close this window to stop)
start "" http://localhost:8000
python -m http.server 8000 2>nul || py -m http.server 8000 || (echo. & echo Python is not installed. Run: winget install Python.Python.3.12 & pause)
