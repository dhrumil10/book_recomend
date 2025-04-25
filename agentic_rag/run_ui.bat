@echo off
:: Windows Batch file to run the BookLovers Agentic RAG UI

echo === BookLovers Agentic RAG Testing UI ===
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.9 or higher.
    exit /b 1
)

:: Get Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set python_version=%%i
echo Python version: %python_version%

:: Install dependencies if needed
echo.
echo Checking for required packages...
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements_ui.txt
    if errorlevel 1 (
        echo Failed to install required packages. Please run 'pip install -r requirements_ui.txt' manually.
        exit /b 1
    )
)

:: Check if .env file exists
if not exist .env (
    echo The .env file is missing. Please create a .env file with the required environment variables.
    echo See UI_README.md for details.
    exit /b 1
)

:: Run the UI
echo.
echo Starting the UI...
echo The UI will be available at: http://127.0.0.1:5050
echo Press Ctrl+C to stop the server.
echo.

python app.py 