# Agentic RAG System for Book Recommendations

This project implements an agentic RAG (Retrieval-Augmented Generation) system for book recommendations. It first tries to answer queries using a Neo4j knowledge graph database. If the information is not found in the graph, it falls back to web search using the Tavily Search API. It also features a specialized trading agent for financial book recommendations that dynamically discovers trading topics from the web.

## Architecture

1. **Graph Database Layer**: Queries Neo4j for book information, author details, genres, etc.
2. **Trading Agent Layer**: Uses Tavily search to dynamically discover trading topics and book recommendations in real-time
3. **Web Search Layer**: Falls back to Tavily web search when graph database lacks information
4. **Response Generation**: Uses OpenAI to generate responses based on retrieved context

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

To run the UI, use:

```
python -m agentic_rag.run_ui
```

## Components

- `graph_agent.py`: Defines the LangGraph workflow and Neo4j database interactions
- `web_agent.py`: Implements the web search fallback using Tavily API
- `trading_agent.py`: Specialized agent for trading topics and financial book recommendations
- `main.py`: Integrates the components and provides a simple interface
- `app.py`: Flask-based UI for interacting with the system

## Flow

1. User submits a query
2. System checks if the query is trading-related:
   - If yes, it routes to the trading agent which uses Tavily search to dynamically discover relevant topics and books
3. If not trading-related, it checks the Neo4j graph database for relevant information
4. If found in graph, it formats the graph data and generates a response
5. If not found, it performs a web search using Tavily
6. The response is generated based on either trading data, graph data, or web search results

## Trading Agent Features

The trading agent specializes in providing dynamic, up-to-date information about trading topics and recommending related books. It can:

- Dynamically discover the top trading topics using Tavily search
- For each topic, find up-to-date book recommendations using separate targeted searches
- Process and structure the search results into a comprehensive list of trading topics with relevant books
- Provide detailed information about specific trading topics (like cryptocurrency, forex, etc.)
- Search for and recommend books on specific trading strategies

Example queries for the trading agent:
- "What are the top trading topics and books?"
- "Recommend books on cryptocurrency trading"
- "What books should I read about technical analysis?"
- "Best books for beginners in forex trading?" 