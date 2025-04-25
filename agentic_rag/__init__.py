"""
Agentic RAG System for Book Recommendations.

This package implements a Retrieval-Augmented Generation system that:
1. First tries to answer queries using a Neo4j knowledge graph database
2. Falls back to web search using Tavily API when needed
3. Generates responses using OpenAI based on retrieved content
"""

__version__ = "0.1.0" 