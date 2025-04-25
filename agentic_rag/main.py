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
        
        # Compile the workflow after all nodes are set
        return workflow.compile()
    
    async def process_message(self, query: str) -> Dict[str, Any]:
        """Process a user message and return a response."""
        # Initialize state
        state = {
            "query": query,
            "graph_data": {},
            "web_data": None,
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
        if final_state["found_in_graph"]:
            response_type = "graph"
            response_data = final_state["graph_data"]
        else:
            response_type = "web"
            response_data = final_state["web_data"]
        
        # Get the response content
        response_content = final_state.get("response")
        
        # If no response content but we have data, generate a fallback response
        if not response_content:
            if response_type == "web" and final_state["web_data"]:
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
        except Exception as e:
            print(f"Error during testing: {str(e)}")
            import traceback
            traceback.print_exc()

    asyncio.run(test_chatbot()) 