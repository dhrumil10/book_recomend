# BookLovers Agentic RAG Testing UI

This is a temporary UI for testing the BookLovers Agentic RAG system. It provides a simple chat interface to interact with the book recommendation chatbot that uses a combination of graph database querying and web search.

## Features

- Chat interface to test the Agentic RAG system
- Example queries to quickly test different capabilities
- Displays the source of information (graph or web)
- Real-time responses from the AI using the graph data or web search

## Prerequisites

1. **Python 3.9+**
2. **Neo4j Database** - Running and accessible at the URI specified in your `.env` file
3. **API Keys** - OpenAI and Tavily API keys in your `.env` file

## Setup

1. Install the required packages:
   ```bash
   pip install -r requirements_ui.txt
   ```

2. Make sure your `.env` file has the following variables:
   ```
   # Neo4j Database Configuration
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=Admin@123
   
   # API Keys
   OPENAI_API_KEY=your-openai-api-key
   TAVILY_API_KEY=your-tavily-api-key
   ```

## Running the UI

1. Navigate to the `agentic_rag` directory:
   ```bash
   cd agentic_rag
   ```

2. Run the UI script:
   ```bash
   python run_ui.py
   ```

3. Open your browser and go to:
   ```
   http://127.0.0.1:5050
   ```

## Usage

1. Type your query in the input box and press Enter or click Send
2. Try questions about:
   - Book recommendations
   - Author information
   - Genre statistics
   - Recent book releases or news (these will likely use web search)

3. The UI will display the source of the information (graph or web) below each response.

## Troubleshooting

- **Neo4j Connection Issues** - Ensure Neo4j is running and the URI, username, and password in your `.env` file are correct
- **API Key Issues** - Verify that your OpenAI and Tavily API keys are valid and correctly set in the `.env` file
- **Import Errors** - Make sure you've installed all requirements with `pip install -r requirements_ui.txt`

## Example Queries

- "Recommend some fantasy books"
- "Tell me about J.K. Rowling"
- "What are the top genres?"
- "What books were released in the last month?"
- "What's the best-selling book of 2023?"
- "Tell me about recent book-to-movie adaptations" 