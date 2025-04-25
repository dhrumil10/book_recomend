# BookLovers Agentic RAG Testing UI

This is a temporary UI for testing the BookLovers Agentic RAG system. It provides a simple chat interface to interact with the book recommendation chatbot that uses a combination of graph database querying, specialized trading topics agent, and web search.

## Features

- Chat interface to test the Agentic RAG system
- Example queries to quickly test different capabilities
- Displays the source of information (graph, trading, or web)
- Real-time responses from the AI using the graph data, trading topic data, or web search
- Specialized trading topics agent for financial book recommendations with dynamic topic discovery

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
   - Trading topics and book recommendations
   - Recent book releases or news (these will likely use web search)

3. The UI will display the source of the information (graph, trading, or web) below each response.

## Trading Agent Features

The trading agent specializes in providing information about trading topics and recommending related books. When a query is detected as trading-related, it will:

1. Use Tavily search to dynamically discover current trading topics in real-time
2. For each discovered topic, find related book recommendations through targeted searches
3. Format the response with structured data about trading topics and book recommendations
4. Display each topic with its recommended books in an easy-to-read format

This approach ensures that trading topics and book recommendations are always current and comprehensive, even as new trading strategies emerge.

Example queries for the trading agent:
- "What are the top trading topics and books?"
- "Recommend books on cryptocurrency trading"
- "What books should I read about technical analysis?"
- "Best books for beginners in forex trading?"

## Troubleshooting

- **Neo4j Connection Issues** - Ensure Neo4j is running and the URI, username, and password in your `.env` file are correct. The system will use mock data if Neo4j is unavailable.
- **API Key Issues** - Verify that your OpenAI and Tavily API keys are valid and correctly set in the `.env` file
- **Import Errors** - Make sure you've installed all requirements with `pip install -r requirements_ui.txt`

## Example Queries

- "Recommend some fantasy books"
- "Tell me about J.K. Rowling"
- "What are the top genres?"
- "What books were released in the last month?"
- "What's the best-selling book of 2023?"
- "Tell me about recent book-to-movie adaptations"
- "Top 10 trading topics and books"
- "Recommend books on cryptocurrency trading"
- "Best books for technical analysis" 