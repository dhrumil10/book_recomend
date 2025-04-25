#!/bin/bash
# Simple script to run the agentic_rag UI

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== BookLovers Agentic RAG Testing UI ===${NC}"
echo

# Check if Python is installed
if ! command -v python >/dev/null 2>&1; then
    echo -e "${RED}Python is not installed. Please install Python 3.9 or higher.${NC}"
    exit 1
fi

# Check Python version
python_version=$(python --version 2>&1 | cut -d " " -f 2)
echo -e "Python version: ${YELLOW}${python_version}${NC}"

# Install dependencies if needed
echo -e "\n${GREEN}Checking for required packages...${NC}"
if ! python -c "import flask" >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing required packages...${NC}"
    pip install -r requirements_ui.txt
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install required packages. Please run 'pip install -r requirements_ui.txt' manually.${NC}"
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}The .env file is missing. Please create a .env file with the required environment variables.${NC}"
    echo -e "See UI_README.md for details."
    exit 1
fi

# Run the UI
echo -e "\n${GREEN}Starting the UI...${NC}"
echo -e "The UI will be available at: ${YELLOW}http://127.0.0.1:5050${NC}"
echo -e "Press Ctrl+C to stop the server."
echo

python app.py 