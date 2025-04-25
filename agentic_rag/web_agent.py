import os
from typing import Dict, Any, List
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import json
import sys
import traceback
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from graph_agent import GraphDatabaseService, embed_text


# Create a Tavily search tool
tavily_search = TavilySearchResults(
    api_key=os.getenv("TAVILY_API_KEY", "your-tavily-api-key"),
    max_results=5,
    include_raw_content=True,
    include_images=False
)

def clean_search_results(results: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Clean and format Tavily search results."""
    cleaned_results = []
    
    # Handle different result formats
    if isinstance(results, str):
        # If results is a string (error message), create a single result
        return [{"title": "Error", "content": results, "url": ""}]
    
    if not isinstance(results, list):
        # If not a list, try to extract results field or return empty list
        if isinstance(results, dict) and "results" in results:
            results = results.get("results", [])
        else:
            return [{"title": "Error", "content": "Invalid search results format", "url": ""}]
    
    for result in results:
        if not isinstance(result, dict):
            continue
            
        # Extract essential information
        cleaned_result = {
            "title": result.get("title", "Untitled") if isinstance(result, dict) else "Untitled",
            "content": result.get("content", "") if isinstance(result, dict) else str(result),
            "url": result.get("url", "") if isinstance(result, dict) else "",
        }
        cleaned_results.append(cleaned_result)
    
    # If we got no valid results, add a message
    if not cleaned_results:
        cleaned_results.append({"title": "No Results", "content": "No search results found", "url": ""})
        
    return cleaned_results

@tool
def web_search(query: str) -> List[Dict[str, str]]:
    """Search the web for information related to the query."""
    try:
        # Add context about books to make the search more relevant
        enhanced_query = f"book information {query}"
        
        # Execute search via Tavily
        search_results = tavily_search.invoke(enhanced_query)
        
        # Process and return the results
        return clean_search_results(search_results)
    except Exception as e:
        print(f"Error in web search: {e}")
        # Return a structured error response instead of raising an exception
        return [{"title": "Error", "content": f"Failed to perform web search: {str(e)}", "url": ""}]

def web_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    """Process web search for the query and return enriched state"""
    print(f"Web agent processing query: {state['query']}")
    user_q = state["query"]
    
    # Check if we have cached web results
    db = GraphDatabaseService()
    try:
        cached_results = db.get_cached_web_results(user_q)
        if cached_results and len(cached_results) > 0:
            print(f"Using cached web results for query: {user_q}")
            response_text = generate_response_from_web_results(user_q, cached_results)
            
            return {
                **state,
                "web_data": cached_results,
                "response": response_text,
                "found_in_graph": False  # This should be False to indicate it's from web
            }
    except Exception as e:
        print(f"Error checking for cached web results: {e}")
        traceback.print_exc()
        # Continue with search if cache retrieval fails
    
    # Perform web search
    try:
        print(f"Performing web search for: {user_q}")
        raw_results = web_search.invoke(user_q)
        print(f"Received {len(raw_results)} web search results")
        
        if not raw_results or len(raw_results) == 0:
            return {
                **state,
                "web_data": [],
                "response": f"I couldn't find any relevant information about '{user_q}' from web searches. Could you try rephrasing your question?",
                "found_in_graph": False
            }
            
        # Generate response from the search results
        response_text = generate_response_from_web_results(user_q, raw_results)
            
        # Try to enrich the results with embeddings
        try:
            enriched = []
            for r in raw_results:
                result_copy = dict(r)  # Make a copy to avoid modifying the original
                try:
                    text = f"{result_copy['title']}\n{result_copy['content']}"
                    result_copy["embedding"] = embed_text(text)
                except Exception as embed_error:
                    print(f"Error creating embedding: {embed_error}")
                    # Add a dummy embedding if needed
                    result_copy["embedding"] = []
                    
                enriched.append(result_copy)
                
            # Try to save to Neo4j
            try:
                db.save_web_results(user_q, enriched)
                print(f"Saved {len(enriched)} web results to Neo4j")
            except Exception as save_error:
                print(f"Error saving web results to Neo4j: {save_error}")
                traceback.print_exc()
                
            # Return with the enriched data and response
            return {
                **state,
                "web_data": raw_results,  # Use raw results without embeddings for the response
                "response": response_text,
                "found_in_graph": False  # Set to False for web results
            }
            
        except Exception as enrich_error:
            print(f"Error enriching results: {enrich_error}")
            traceback.print_exc()
            # Fall back to raw results without embeddings
            return {
                **state,
                "web_data": raw_results,
                "response": response_text,
                "found_in_graph": False
            }
            
    except Exception as e:
        print(f"Web search failed: {e}")
        traceback.print_exc()
        return {
            **state,
            "web_data": [],
            "response": f"I apologize, but I was unable to perform a web search for '{user_q}'. You might want to try reformulating your question or asking something else.",
            "found_in_graph": False
        }
    finally:
        try:
            db.close()
        except:
            pass

def generate_response_from_web_results(query: str, results: List[Dict[str, Any]]) -> str:
    """Generate a response based on web search results"""
    if not results or len(results) == 0:
        return f"I couldn't find any information about '{query}' from web searches. Could you try rephrasing your question?"
    
    try:
        # Format the results into a prompt
        prompt = format_web_results_prompt(query, results)
        
        # Use OpenAI to generate a response
        model = ChatOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="gpt-4",
            temperature=0.7
        )
        
        print(f"Sending web results to OpenAI for query: {query}")
        response = model.invoke([HumanMessage(content=prompt)])
        return response.content
    except Exception as e:
        print(f"Error generating response from web results: {e}")
        traceback.print_exc()
        
        # Fallback to a simple response using the results
        if results and len(results) > 0:
            first_result = results[0]
            title = first_result.get("title", "an article")
            content_snippet = first_result.get("content", "")[:100] + "..."
            
            return (f"Based on my web search about '{query}', I found information in {title}. "
                    f"It mentions that {content_snippet} You can find more information in the sources below.")
        else:
            return f"I found some information about '{query}', but I'm having trouble summarizing it. Please check the sources below for details."

def format_web_results_prompt(query: str, results: List[Dict[str, Any]]) -> str:
    """Format web search results into a prompt for the AI"""
    formatted_results = ""
    
    # Include up to 4 results to stay within token limits
    for i, result in enumerate(results[:4]):
        title = result.get("title", "Untitled")
        content = result.get("content", "No content")
        url = result.get("url", "No URL")
        
        formatted_results += f"Source {i+1}: {title}\n"
        formatted_results += f"URL: {url}\n"
        formatted_results += f"Content: {content[:500]}{'...' if len(content) > 500 else ''}\n\n"
    
    prompt = f"""
You are a helpful assistant for a book social network called BookLovers. 
The user has asked: "{query}"

I couldn't find relevant information in our book database, but I found these web search results:

{formatted_results}

Based on these search results, please provide a helpful, conversational response to the user's query.
Focus on book-related information and recommendations if available.
If the search results don't directly answer the user's question, acknowledge that and provide the most relevant information you can find.
Keep your response friendly, helpful, and concise.
"""
    
    return prompt

# For direct testing
if __name__ == "__main__":
    test_query = "recommend books similar to Harry Potter"
    results = web_search(test_query)
    print(json.dumps(results, indent=2)) 