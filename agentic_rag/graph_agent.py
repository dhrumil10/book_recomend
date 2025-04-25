from typing import Dict, List, Any, TypedDict, Literal, Optional
import os
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from neo4j import GraphDatabase
import re
import numpy as np
from sentence_transformers import SentenceTransformer


# — normalize text (lowercase, strip punctuation, collapse spaces)
def normalize_text(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r'[^\w\s]', '', t)
    return re.sub(r'\s+', ' ', t)

# — load one SentenceTransformer once for embeddings
_embedder = SentenceTransformer("all-MiniLM-L6-v2")

def embed_text(text: str) -> list[float]:
    return _embedder.encode(text).tolist()


class GraphDatabaseService:
    def __init__(self, uri=None, username=None, password=None):
        # Use environment variables with fallbacks
        self.driver = GraphDatabase.driver(
            uri or os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            auth=(
                username or os.getenv("NEO4J_USERNAME", "neo4j"),
                password or os.getenv("NEO4J_PASSWORD", "Admin@123")
            )
        )
        
    def close(self):
        self.driver.close()
        
    def execute_query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return [record for record in result]
    
    def search_book_knowledge(self, query: str) -> Dict[str, Any]:
        """Search the Neo4j graph database for book-related information"""
        keywords = query.lower().split()
        graph_data = {}
        
        # Check for recommendation intent
        if any(k in keywords for k in ['recommend', 'recommendation', 'similar', 'like', 'suggest', 'suggestion']):
            # Try to extract a book title from the query
            title_match = None
            
            # Look for patterns like "similar to [TITLE]" or "like [TITLE]"
            similar_patterns = [
                r'similar to (?:the )?(.*?)(?:$|\.|\?|,|by)', 
                r'like (?:the )?(.*?)(?:$|\.|\?|,|by)',
                r'recommend (?:books? )?(?:like|similar to) (?:the )?(.*?)(?:$|\.|\?|,|by)',
                r'books? similar to (?:the )?(.*?)(?:$|\.|\?|,|by)'
            ]
            
            for pattern in similar_patterns:
                match = re.search(pattern, query.lower())
                if match:
                    title_match = match.group(1).strip()
                    break
            
            # If we found a potential title, search for similar books
            if title_match:
                print(f"Detected book title in query: '{title_match}'")
                similar_books = self.find_similar_books(title_match)
                if similar_books:
                    graph_data["recommendations"] = similar_books
                    graph_data["type"] = "recommendations"
                    graph_data["search_term"] = title_match
            else:
                # No specific title, get general recommendations
                graph_data["recommendations"] = self.get_book_recommendations(3)
                graph_data["type"] = "recommendations"
        
        # Check for author intent
        if any(k in keywords for k in ['author', 'wrote', 'writer']):
            potential_author = query.lower().replace("who is", "").replace("tell me about", "").strip()
            if potential_author:
                author_info = self.get_author_info(potential_author)
                if author_info:
                    graph_data["author"] = author_info["author"]
                    graph_data["books"] = author_info["books"]
                    graph_data["type"] = "author"
        
        # Check for genre intent
        if any(k in keywords for k in ['genre', 'type', 'category']):
            graph_data["genres"] = self.get_top_genres()
            graph_data["type"] = "genres"
            
        return graph_data
        
    def get_book_recommendations(self, limit=3):
        query = """
        MATCH (b:BOOK)
        WHERE b.rating > 4.0
        RETURN b.title as title, b.author as author, b.rating as rating
        ORDER BY b.rating DESC
        LIMIT $limit
        """
        
        records = self.execute_query(query, {"limit": limit})
        return [{
            "title": record["title"],
            "author": record["author"],
            "rating": record["rating"],
            "matchScore": int((float(record["rating"]) / 5) * 100)
        } for record in records]
    
    def get_author_info(self, author_name):
        query = """
        MATCH (a:AUTHOR)
        WHERE toLower(a.name) CONTAINS toLower($name)
        OPTIONAL MATCH (a)-[:WROTE]->(b:BOOK)
        RETURN a, collect(b) as books
        LIMIT 1
        """
        
        records = self.execute_query(query, {"name": author_name})
        
        if not records:
            return None
            
        record = records[0]
        author = record["a"]
        books = record["books"]
        
        return {
            "author": {
                "name": author["name"],
                "birthYear": author.get("birthYear", "Unknown"),
                "deathYear": author.get("deathYear", ""),
                "bio": author.get("bio", "No biography available")
            },
            "books": [{
                "title": book["title"],
                "publishYear": book.get("publishYear", "Unknown")
            } for book in books]
        }
        
    def get_top_genres(self, limit=3):
        query = """
        MATCH (b:BOOK)-[:BELONGS_TO]->(g:GENRE)
        WITH g.name as genre, count(*) as bookCount
        ORDER BY bookCount DESC
        LIMIT $limit
        """
        
        records = self.execute_query(query, {"limit": limit})
        return [{
            "name": record["genre"],
            "percentage": int((record["bookCount"] / 10) * 100)
        } for record in records]
    
    def find_similar_books(self, title_query: str) -> List[Dict[str, Any]]:
        """Find books similar to the title mentioned in the query"""
        # First try to find the book by exact or partial title match
        find_book_query = """
        MATCH (b:BOOK)
        WHERE toLower(b.title) CONTAINS toLower($title)
        RETURN b
        ORDER BY size(b.title) ASC
        LIMIT 1
        """
        
        records = self.execute_query(find_book_query, {"title": title_query})
        
        if not records:
            print(f"No book found with title containing '{title_query}'")
            return []
        
        book = records[0]["b"]
        book_id = book.get("id", "")
        
        if not book_id:
            return []
        
        # Now find similar books based on genre overlap
        similar_books_query = """
        MATCH (b:BOOK {id: $bookId})-[:BELONGS_TO]->(g:GENRE)<-[:BELONGS_TO]-(similar:BOOK)
        WHERE similar.id <> $bookId
        WITH similar, count(g) as genreOverlap
        
        OPTIONAL MATCH (similar)<-[:WROTE]-(a:AUTHOR)
        
        RETURN similar.title as title, a.name as author, similar.rating as rating,
               genreOverlap, similar.publishYear as publishYear
        ORDER BY genreOverlap DESC, rating DESC
        LIMIT 3
        """
        
        similar_books = self.execute_query(similar_books_query, {"bookId": book_id})
        
        return [{
            "title": record["title"],
            "author": record["author"],
            "rating": record.get("rating", 0),
            "matchScore": min(100, int((record.get("genreOverlap", 1) / 3) * 100))
        } for record in similar_books]

    def find_similar_query(self, vec: list[float], threshold: float = 0.90):
        """
        Community-Edition fallback:
        Pull all Query nodes with embeddings into Python,
        compute cosine similarity, and return the id of the best match
        if it's above the threshold.
        """
        # 1) Fetch every stored Query node's id + embedding
        cypher = """
        MATCH (q:Query)
        WHERE q.embedding IS NOT NULL
        RETURN elementId(q) AS nodeId, q.embedding AS embedding
        """
        records = self.execute_query(cypher, {})

        # 2) Compute cosine similarity in Python
        v1 = np.array(vec, dtype=float)
        best_sim, best_id = -1.0, None
        for r in records:
            v2 = np.array(r["embedding"], dtype=float)
            sim = float((v1 @ v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
            if sim > best_sim:
                best_sim, best_id = sim, r["nodeId"]

        # 3) Only return the id if it passes threshold
        return best_id if best_sim >= threshold else None
    
    def get_or_create_query_node(self, original: str) -> int:
        """
        1) Normalize & embed the question
        2) If a semantically‐similar Query exists, return its id
        3) Otherwise MERGE on normText and store embedding+raw text
        """
        norm = normalize_text(original)
        vec  = embed_text(norm)

        existing = self.find_similar_query(vec)
        if existing is not None:
            return existing

        cypher = """
        MERGE (q:Query {normText: $norm})
          ON CREATE SET
            q.text      = $orig,
            q.embedding = $vec
        RETURN id(q) AS nodeId
        """
        rec = self.execute_query(cypher, {"norm": norm, "orig": original, "vec": vec})
        return rec[0]["nodeId"]

    def save_web_results(self, original_query: str, results: list[dict]):
        """
        Upsert the Query node (via get_or_create_query_node),
        then MERGE each WebResult + a HAS_RESULT edge exactly once.
        Assumes each result dict has keys: url, title, content, embedding.
        """
        qid = self.get_or_create_query_node(original_query)

        cypher = """
        UNWIND $results AS r
          MERGE (w:WebResult {url: r.url})
            ON CREATE SET
              w.title     = r.title,
              w.content   = r.content,
              w.fetchedAt = datetime(),
              w.embedding = r.embedding
          WITH w
          MATCH (q) WHERE id(q) = $qid
          MERGE (q)-[:HAS_RESULT]->(w)
        """
        self.execute_query(cypher, {"results": results, "qid": qid})

    def get_cached_web_results(self, original_query: str) -> list[dict]:
        """
        If we've previously saved web‐fallback results for this question,
        return them instead of hitting the web again.
        """
        # Normalize the query the same way we did on write
        norm = normalize_text(original_query)

        cypher = """
        MATCH (q:Query {normText: $norm})
          -[:HAS_RESULT]->(w:WebResult)
        RETURN w.title AS title,
               w.content AS content,
               w.url AS url
        """
        records = self.execute_query(cypher, {"norm": norm})
        return [
            {"title": r["title"], "content": r["content"], "url": r["url"]}
            for r in records
        ]


class AgentState(TypedDict):
    """State for the RAG agent workflow."""
    query: str
    graph_data: Dict[str, Any]
    web_data: Optional[List[Dict[str, str]]]
    response: Optional[str]
    found_in_graph: bool

def query_graph(state: AgentState) -> AgentState:
    db = GraphDatabaseService()
    try:
        # 1) Domain lookup
        graph_data = db.search_book_knowledge(state["query"])
        if graph_data.get("type"):
            return { **state, "graph_data": graph_data, "found_in_graph": True }

        # 2) Cached‐web lookup
        cached = db.get_cached_web_results(state["query"])
        if cached:
            # Treat it as "found," storing cached web into state.web_data
            return { **state,
                     "web_data": cached,
                     "found_in_graph": True }
        
        # 3) genuinely not found → fall back
        return { **state, "graph_data": {}, "found_in_graph": False }
    finally:
        db.close()



def should_search_web(state: AgentState) -> Literal["web_search", "generate_response"]:
    """Decide whether to search the web or generate a response from graph data."""
    if state["found_in_graph"]:
        return "generate_response"
    else:
        return "web_search"


def format_graph_data(graph_data: Dict[str, Any]) -> str:
    """Format graph data for inclusion in the prompt."""
    context_text = "Based on the user's graph data:\n\n"
    
    if graph_data.get("type") == "recommendations" and graph_data.get("recommendations"):
        if len(graph_data["recommendations"]) > 0:
            context_text += "Book Recommendations:\n"
            for i, book in enumerate(graph_data["recommendations"]):
                context_text += f"{i+1}. \"{book['title']}\" by {book.get('author', 'Unknown')} - {book.get('matchScore', 0)}% match\n"
        else:
            context_text += "No specific book recommendations found for this query in our knowledge graph.\n"
    
    if graph_data.get("type") == "author" and graph_data.get("author"):
        author = graph_data["author"]
        books = graph_data.get("books", [])
        context_text += f"Author Information:\n{author['name']} ({author.get('birthYear', 'Unknown')}-{author.get('deathYear', 'present') or 'present'})\n"
        context_text += f"Known for: {', '.join(b['title'] for b in books)}\n"
        context_text += f"Bio: {author.get('bio', 'No biography available')}\n"
    
    if graph_data.get("type") == "genres" and graph_data.get("genres"):
        if len(graph_data["genres"]) > 0:
            context_text += "User's Top Genres:\n"
            for i, genre in enumerate(graph_data["genres"]):
                context_text += f"{i+1}. {genre.get('name', 'Unknown')} ({genre.get('percentage', 0)}% of books)\n"
        else:
            context_text += "No genre information found for this user in our knowledge graph.\n"
    
    return context_text


def generate_response(state: AgentState) -> AgentState:
    """Generate a response using OpenAI with context from graph or web data."""
    model = ChatOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-4",
        temperature=0.7
    )
    
    if state["found_in_graph"]:
        context = format_graph_data(state["graph_data"])
        source = "graph database"
        
        # Check if we have an empty result but know the type
        graph_type = state["graph_data"].get("type")
        if graph_type == "recommendations" and not state["graph_data"].get("recommendations", []):
            context += "\nNOTE: We detected a request for book recommendations but did not find specific recommendations in our database."
            context += "\nPlease provide a response that acknowledges this and suggests the user try a different query or offer to search for books similar to what they mentioned."
    else:
        context = "Web search results:\n" + "\n".join([
            f"- {result['title']}: {result['content'][:200]}..." 
            for result in state.get("web_data", [])
        ])
        source = "web search"
    
    prompt = f"""
    You are a helpful assistant for a book social network called BookLovers. 
    You have access to a knowledge graph that contains information about users, books, authors, genres, and more.
    
    {context}
    
    User query: "{state['query']}"
    
    Please respond to the user in a helpful, conversational manner using the {source} data provided.
    Make your response friendly and concise. If recommending books, explain briefly why they might enjoy them.
    
    If you don't have specific book recommendations or information from the knowledge graph,
    DO NOT make up fake book titles or authors. Instead, acknowledge that you don't have that specific information
    and offer to help with a different query or suggest a search for similar topics.
    """
    
    response = model.invoke([HumanMessage(content=prompt)])
    
    return {
        **state,
        "response": response.content
    }


def create_graph_rag_workflow():
    """Create the LangGraph workflow for RAG with web fallback."""
    workflow = StateGraph(AgentState)
    
    # Define nodes
    workflow.add_node("query_graph", query_graph)
    workflow.add_node("generate_response", generate_response)
    
    # Define edges
    workflow.set_entry_point("query_graph")
    workflow.add_conditional_edges(
        "query_graph",
        should_search_web,
        {
            "generate_response": "generate_response",
            "web_search": "web_agent"  # This will be added in main.py
        }
    )
    workflow.add_edge("generate_response", END)
    
    # Return workflow without compiling
    return workflow 
    


