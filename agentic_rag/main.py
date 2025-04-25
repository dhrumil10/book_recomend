import os
from typing import Dict, Any
from dotenv import load_dotenv
from langgraph.graph import END
from pathlib import Path as FSPath

# Pydantic models
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

# Add the parent directory to the Python path
import sys
sys.path.append(str(FSPath(__file__).parent.parent))
# 
#   sysironment variables from .env fil

load_dotenv()

# Import the components
from graph_agent import create_graph_rag_workflow
from web_agent import web_agent
from trading_agent import trading_agent
from location_agent import location_agent

class BookChatbot:
    def __init__(self):
        # Initialize the workflow
        self.workflow = self._setup_workflow()
    
    def _setup_workflow(self):
        # Get the basic workflow
        workflow = create_graph_rag_workflow()
        
        # Add the web_agent node and edge
        workflow.add_node("web_agent", web_agent)
        workflow.add_edge("web_agent", "generate_response")
        
        # Add the trading_agent node
        workflow.add_node("trading_agent", trading_agent)
        
        # Add the location_agent node
        workflow.add_node("location_agent", location_agent)
        
        # Add decision point after query_graph
        def route_to_agent(state):
            query = state.get("query", "").lower()
            
            # Check for trading-related query
            if any(term in query for term in ["trading", "trade", "stock", "forex", "invest", "market", "crypto", "option", "day trade", "value invest"]):
                return "trading_agent"
                
            # Check for location-related query
            location_terms = ["location", "city", "country", "place", "travel", "visit", "in ", "from "]
            if any(term in query for term in location_terms) or "books about " in query or "books set in " in query:
                return "location_agent"
                
            # If not found in graph, use web search
            elif not state.get("found_in_graph", False):
                return "web_search"
                
            # Default to the standard response generator
            else:
                return "generate_response"
        
        # Add conditional edges without trying to remove existing ones first
        # Just define the routing from query_graph directly
        workflow.add_conditional_edges(
            "query_graph",
            route_to_agent,
            {
                "trading_agent": "trading_agent",
                "location_agent": "location_agent", 
                "web_search": "web_agent",
                "generate_response": "generate_response"
            }
        )
        
        # Add edges from agents to generate_response
        workflow.add_edge("trading_agent", "generate_response")
        workflow.add_edge("location_agent", "generate_response")
        
        # Compile the workflow after all nodes are set
        return workflow.compile()
    
    async def process_message(self, query: str) -> Dict[str, Any]:
        """Process a user message and return a response."""
        # Initialize state
        state = {
            "query": query,
            "graph_data": {},
            "web_data": None,
            "trading_data": None,
            "location_data": None,
            "response": None,
            "found_in_graph": False
        }
        
        # Execute the workflow
        print("Starting workflow execution...")
        final_state = None
        
        try:
            async for event in self.workflow.astream(state):
                print(f"Received event type: {list(event.keys())}")
                
                # Check for web_agent node specifically
                if "web_agent" in event:
                    print("Received web agent response")
                    web_state = event["web_agent"]
                    if web_state.get("response"):
                        print(f"Web agent response: {web_state['response'][:50]}...")
                    else:
                        print("Web agent did not return a response")
                
                # Check for trading_agent node
                if "trading_agent" in event:
                    print("Received trading agent response")
                    trading_state = event["trading_agent"]
                    if trading_state.get("response"):
                        print(f"Trading agent response: {trading_state['response'][:50]}...")
                    else:
                        print("Trading agent did not return a response")
                
                # Check for location_agent node
                if "location_agent" in event:
                    print("Received location agent response")
                    location_state = event["location_agent"]
                    if location_state.get("response"):
                        print(f"Location agent response: {location_state['response'][:50]}...")
                    else:
                        print("Location agent did not return a response")
                        
                # The generate_response node will have the final state
                if "generate_response" in event:
                    final_state = event["generate_response"]
                    print("Received generate_response final state")
        except Exception as e:
            print(f"Error during workflow execution: {str(e)}")
            import traceback
            traceback.print_exc()
        
        # If we didn't get a final state, return an error
        if not final_state:
            print("No final state received from workflow")
            return {
                "type": "error",
                "content": "Failed to process message through the workflow.",
                "data": None
            }
        
        # Determine the response type
        if final_state.get("location_data"):
            response_type = "location"
            response_data = final_state["location_data"]
        elif final_state.get("trading_data"):
            response_type = "trading"
            response_data = final_state["trading_data"]
        elif final_state["found_in_graph"]:
            response_type = "graph"
            response_data = final_state["graph_data"]
        else:
            response_type = "web"
            response_data = final_state["web_data"]
        
        # Get the response content
        response_content = final_state.get("response")
        
        # If no response content but we have data, generate a fallback response
        if not response_content:
            if response_type == "location" and final_state["location_data"]:
                # Simple fallback for location data
                location = final_state["location_data"]["location"]
                categories = final_state["location_data"].get("categories", [])
                if categories:
                    category_names = [cat["name"] for cat in categories[:3]]
                    response_content = f"I found books about {location} in these categories: {', '.join(category_names)}. Each category contains recommended books that will enhance your understanding or experience of {location}."
                else:
                    response_content = f"I searched for books related to {location} but couldn't find specific recommendations. Try asking about a different location or be more specific."
            elif response_type == "trading" and final_state["trading_data"]:
                # Simple fallback for trading data
                topics = [topic.get('name', '') for topic in final_state["trading_data"] if topic.get('name')]
                if topics:
                    topics_text = ", ".join(topics[:3])
                    response_content = f"I found some trading topics that might interest you, including {topics_text}. Each topic has recommended books to help you learn more."
                else:
                    response_content = f"I found information about trading topics that might help with your question about '{query}'. These topics cover different aspects of trading with book recommendations for each."
            elif response_type == "web" and final_state["web_data"]:
                # Simple fallback for web data
                titles = [item.get('title', '') for item in final_state["web_data"] if item.get('title')]
                if titles:
                    titles_text = ", ".join(titles[:3])
                    response_content = f"I found some information that might help with your question about '{query}'. I found sources including {titles_text}."
                else:
                    response_content = f"I searched the web for information about '{query}', but I'm having trouble summarizing the results."
            else:
                # Generic fallback
                response_content = f"I processed your query about '{query}', but I'm not able to generate a proper response. Please try asking in a different way."
        
        # Debug output
        print(f"Final response type: {response_type}")
        print(f"Response data count: {len(response_data) if isinstance(response_data, list) else 'N/A'}")
        print(f"Response content: {response_content[:100]}...")
        
        return {
            "type": response_type,
            "content": response_content,
            "data": response_data
        }

# Example usage
if __name__ == "__main__":
    import asyncio
    import sys
    import os
    
    # Add the parent directory to sys.path to allow direct script execution
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    
    # Use direct imports for script execution
    from agentic_rag.graph_agent import create_graph_rag_workflow
    from agentic_rag.web_agent import web_agent
    from agentic_rag.trading_agent import trading_agent
    from agentic_rag.location_agent import location_agent
    
    async def test_chatbot():
        chatbot = BookChatbot()
        
        try:
            # Test with graph-based query
            print("\n=== Testing with a query that should be in the graph ===")
            response = await chatbot.process_message("Recommend some fantasy books")
            print(f"Response type: {response['type']}")
            print(f"Response: {response['content']}")
            
            # Test with web-based query
            print("\n=== Testing with a query that might need web search ===")
            response = await chatbot.process_message("What are the latest book releases in 2023?")
            print(f"Response type: {response['type']}")
            print(f"Response: {response['content']}")
            
            # Test with trading-related query
            print("\n=== Testing with a trading-related query ===")
            response = await chatbot.process_message("Tell me about top trading topics and book recommendations")
            print(f"Response type: {response['type']}")
            print(f"Response: {response['content']}")
            
            # Test with location-related query
            print("\n=== Testing with a location-related query ===")
            response = await chatbot.process_message("Recommend books about Paris")
            print(f"Response type: {response['type']}")
            print(f"Response: {response['content']}")
        except Exception as e:
            print(f"Error during testing: {str(e)}")
            import traceback
            traceback.print_exc()

    asyncio.run(test_chatbot()) 