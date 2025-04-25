# Agentic RAG System for Book Recommendations

This project implements an agentic RAG (Retrieval-Augmented Generation) system for book recommendations. It first tries to answer queries using a Neo4j knowledge graph database. If the information is not found in the graph, it falls back to web search using the Tavily Search API.

## Architecture

1. **Graph Database Layer**: Queries Neo4j for book information, author details, genres, etc.
2. **Web Search Layer**: Falls back to Tavily web search when graph database lacks information
3. **Response Generation**: Uses OpenAI to generate responses based on retrieved context

## Setup

1. Create a `.env` file in the root directory with the following content:
```
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
```

2. Install dependencies:
```
pip install -r requirements.txt
```

3. Make sure your Neo4j database is running and has book data with the following structure:
   - (:BOOK) nodes with properties like title, author, rating
   - (:AUTHOR) nodes with properties like name, birthYear, deathYear, bio
   - (:GENRE) nodes with name property
   - Relationships: (:AUTHOR)-[:WROTE]->(:BOOK), (:BOOK)-[:BELONGS_TO]->(:GENRE)

## Usage

You can use the system directly:

```python
from agentic_rag.main import BookChatbot
import asyncio

async def chat():
    chatbot = BookChatbot()
    response = await chatbot.process_message("Recommend books similar to Harry Potter")
    print(response["content"])

asyncio.run(chat())
```

Or run the example script:

```
python -m agentic_rag.main
```

## Components

- `langgraph.py`: Defines the LangGraph workflow and Neo4j database interactions
- `web_agent.py`: Implements the web search fallback using Tavily API
- `main.py`: Integrates the components and provides a simple interface

## Flow

1. User submits a query
2. System checks the Neo4j graph database for relevant information
3. If found, it formats the graph data and generates a response
4. If not found, it performs a web search using Tavily
5. The response is generated based on either graph data or web search results 