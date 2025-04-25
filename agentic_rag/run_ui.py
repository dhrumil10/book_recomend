#!/usr/bin/env python
"""
BookLovers Agentic RAG UI Runner

This script runs the temporary UI for testing the Agentic RAG system.

Prerequisites:
1. Make sure you have installed the required packages:
   pip install -r requirements_ui.txt

2. Make sure the .env file contains the necessary environment variables:
   - NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD
   - OPENAI_API_KEY
   - TAVILY_API_KEY

Usage:
   python run_ui.py
"""

import os
import sys
import subprocess
from pathlib import Path

# Ensure we're in the agentic_rag directory
current_dir = Path(__file__).parent
os.chdir(current_dir)

def check_environment():
    """Check if the required environment variables are set"""
    required_vars = [
        "NEO4J_URI", "NEO4J_USERNAME", "NEO4J_PASSWORD",
        "OPENAI_API_KEY", "TAVILY_API_KEY"
    ]
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("ERROR: .env file not found. Please create a .env file with the required environment variables.")
        sys.exit(1)
    
    # Check if required packages are installed
    try:
        import flask
        import flask_cors
        import langchain
        import neo4j
    except ImportError as e:
        print(f"ERROR: Required package not installed: {e}")
        print("Please run: pip install -r requirements_ui.txt")
        sys.exit(1)
    
    print("Environment check passed!")

def run_ui():
    """Run the Flask UI"""
    print("Starting BookLovers Agentic RAG UI...")
    print("The UI will be available at: http://127.0.0.1:5050")
    subprocess.run([sys.executable, "app.py"], check=True)

if __name__ == "__main__":
    print("=" * 50)
    print("BookLovers Agentic RAG Testing UI")
    print("=" * 50)
    
    check_environment()
    run_ui() 