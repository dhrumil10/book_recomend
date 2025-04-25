import os
import json
import asyncio
import sys
from pathlib import Path
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv
from typing import Dict, Any, List
from main import BookChatbot
from pydantic import BaseModel

# Add the current directory to the Python path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize the chatbot
chatbot = BookChatbot()

# Example queries to show in the UI
example_queries = [
    "Recommend fantasy books similar to Lord of the Rings",
    "What are good science fiction books about space exploration?",
    "Tell me about top trading topics and book recommendations",
    "Recommend books on cryptocurrency trading strategies",
    "Suggest books about the history of Paris",
    "What are good books set in Tokyo?",
    "Recommend travel literature about Iceland"
]

# HTML template for the UI
HTML_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BookLovers Agentic RAG Testing</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .user-message {
            background-color: #e3f2fd;
            border-radius: 1rem;
            padding: 0.75rem 1rem;
            margin: 0.5rem 0;
            max-width: 80%;
            align-self: flex-end;
        }
        .bot-message {
            background-color: #f1f5f9;
            border-radius: 1rem;
            padding: 0.75rem 1rem;
            margin: 0.5rem 0;
            max-width: 80%;
            align-self: flex-start;
        }
        #chat-container {
            display: flex;
            flex-direction: column;
            height: 70vh;
            overflow-y: auto;
            padding: 1rem;
        }
        .data-card {
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 0.75rem;
            margin-top: 0.5rem;
            background-color: #f8fafc;
        }
        .book-item {
            border-left: 3px solid #6366f1;
            padding-left: 8px;
            margin: 4px 0;
        }
        .topic-header {
            font-weight: 600;
            margin-top: 8px;
            color: #4f46e5;
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto py-8 px-4">
        <div class="bg-white rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold text-indigo-600 mb-4">BookLovers Agentic RAG Testing UI</h1>
            
            <div id="chat-container" class="border border-gray-200 rounded-md mb-4 bg-white">
                <div class="bot-message">
                    Hello! I'm the BookLovers assistant. I can help you find books, learn about authors, discover genres, trading topics, and more. What would you like to know?
                </div>
            </div>
            
            <div class="flex">
                <input 
                    type="text" 
                    id="user-input"
                    placeholder="Ask something about books..."
                    class="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                <button 
                    id="send-button" 
                    class="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
                >
                    Send
                </button>
            </div>
            
            <div class="mt-4">
                <p class="text-sm text-gray-500">Example queries:</p>
                <div class="flex flex-wrap gap-2 mt-1">
                    <button class="example-query text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-md">Recommend some fantasy books</button>
                    <button class="example-query text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-md">Tell me about J.K. Rowling</button>
                    <button class="example-query text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-md">What are the top genres?</button>
                    <button class="example-query text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-md">What are the latest book releases in 2023?</button>
                    <button class="example-query text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-md">Top 10 trading topics and books</button>
                    <button class="example-query text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-md">Recommend books on cryptocurrency trading</button>
                </div>
            </div>
            
            <div class="mt-4 text-xs text-gray-500">
                <p>Response source: <span id="response-source" class="font-semibold">-</span></p>
            </div>
        </div>
    </div>
    
    <script>
        const chatContainer = document.getElementById('chat-container');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const responseSource = document.getElementById('response-source');
        const exampleQueries = document.querySelectorAll('.example-query');
        
        // Handle sending messages
        function sendMessage() {
            const message = userInput.value.trim();
            if (!message) return;
            
            // Add user message to chat
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'user-message';
            userMessageDiv.textContent = message;
            chatContainer.appendChild(userMessageDiv);
            
            // Add loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'bot-message';
            loadingDiv.textContent = 'Thinking...';
            chatContainer.appendChild(loadingDiv);
            
            // Scroll to bottom
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            // Clear input
            userInput.value = '';
            
            // Send request to server
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: message })
            })
            .then(response => response.json())
            .then(data => {
                // Remove loading indicator
                chatContainer.removeChild(loadingDiv);
                
                // Add bot response
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'bot-message';
                botMessageDiv.textContent = data.content;
                
                // Add data cards if applicable
                if (data.type === 'graph' && data.data && Object.keys(data.data).length > 0) {
                    const dataType = Object.keys(data.data).find(k => 
                        ['recommendations', 'author', 'genres', 'type'].includes(k)
                    );
                    
                    if (dataType) {
                        const dataCard = document.createElement('div');
                        dataCard.className = 'data-card text-xs mt-2';
                        
                        if (dataType === 'recommendations' && data.data.recommendations) {
                            dataCard.innerHTML = '<div class="font-semibold mb-1">Book Recommendations:</div>';
                            data.data.recommendations.forEach((book, i) => {
                                dataCard.innerHTML += `<div>${i+1}. "${book.title}" by ${book.author || 'Unknown'} - ${book.matchScore}% match</div>`;
                            });
                        }
                        
                        botMessageDiv.appendChild(dataCard);
                    }
                }
                // Add trading topic cards
                else if (data.type === 'trading' && Array.isArray(data.data) && data.data.length > 0) {
                    const dataCard = document.createElement('div');
                    dataCard.className = 'data-card text-xs mt-2';
                    
                    dataCard.innerHTML = '<div class="font-semibold mb-2">Trading Topics and Book Recommendations:</div>';
                    
                    // Display up to 5 topics with their books
                    const topicsToShow = data.data.slice(0, 5);
                    topicsToShow.forEach((topic, i) => {
                        if (topic.name) {
                            dataCard.innerHTML += `<div class="topic-header">${i+1}. ${topic.name}</div>`;
                            dataCard.innerHTML += `<div class="text-gray-600 mb-1">${topic.description || ''}</div>`;
                            
                            if (topic.books && topic.books.length > 0) {
                                dataCard.innerHTML += '<div class="ml-3 mt-1">';
                                topic.books.forEach(book => {
                                    dataCard.innerHTML += `<div class="book-item">"${book.title}" by ${book.author}</div>`;
                                });
                                dataCard.innerHTML += '</div>';
                            }
                        }
                    });
                    
                    botMessageDiv.appendChild(dataCard);
                }
                // Add web search data card if applicable
                else if (data.type === 'web' && data.data) {
                    const dataCard = document.createElement('div');
                    dataCard.className = 'data-card text-xs mt-2';
                    
                    dataCard.innerHTML = '<div class="font-semibold mb-1">Web Search Results:</div>';
                    if (Array.isArray(data.data)) {
                        // Display up to 3 sources
                        const sources = data.data.slice(0, 3);
                        sources.forEach((source, i) => {
                            if (source.title && source.url) {
                                dataCard.innerHTML += `<div>${i+1}. <a href="${source.url}" target="_blank" class="text-blue-600 hover:underline">${source.title}</a></div>`;
                            }
                        });
                    }
                    
                    botMessageDiv.appendChild(dataCard);
                }
                
                chatContainer.appendChild(botMessageDiv);
                
                // Update response source
                responseSource.textContent = data.type;
                if (data.type === 'web') {
                    responseSource.classList.add('text-blue-600');
                    responseSource.classList.remove('text-green-600');
                    responseSource.classList.remove('text-amber-600');
                } else if (data.type === 'trading') {
                    responseSource.classList.remove('text-blue-600');
                    responseSource.classList.add('text-amber-600');
                    responseSource.classList.remove('text-green-600');
                } else {
                    responseSource.classList.remove('text-blue-600');
                    responseSource.classList.remove('text-amber-600');
                    responseSource.classList.add('text-green-600');
                }
                
                // Scroll to bottom
                chatContainer.scrollTop = chatContainer.scrollHeight;
            })
            .catch(error => {
                // Remove loading indicator
                chatContainer.removeChild(loadingDiv);
                
                // Add error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'bot-message';
                errorDiv.textContent = 'Sorry, something went wrong. Please try again.';
                chatContainer.appendChild(errorDiv);
                
                // Scroll to bottom
                chatContainer.scrollTop = chatContainer.scrollHeight;
                
                console.error('Error:', error);
            });
        }
        
        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Example query handling
        exampleQueries.forEach(button => {
            button.addEventListener('click', () => {
                userInput.value = button.textContent;
                sendMessage();
            });
        });
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template('index.html', example_queries=example_queries)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        # Process the message using our chatbot
        result = asyncio.run(chatbot.process_message(query))
        
        # Handle different response types
        response_type = result.get('type', 'text')
        content = result.get('content', '')
        data = result.get('data', None)
        
        response = {
            'type': response_type,
            'message': content,
        }
        
        # Add specific data based on response type
        if response_type == 'graph' and data:
            # Format graph data for display
            response['data'] = format_graph_data(data)
        elif response_type == 'web' and data:
            # Format web search results for display
            response['data'] = format_web_data(data)
        elif response_type == 'trading' and data:
            # Format trading topics for display
            response['data'] = format_trading_data(data)
        elif response_type == 'location' and data:
            # Format location books for display
            response['data'] = format_location_data(data)
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        print(f"Error processing request: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def format_graph_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Format graph data for display in the UI."""
    formatted_data = {
        'nodes': [],
        'relationships': []
    }
    
    if 'nodes' in data:
        formatted_data['nodes'] = data['nodes']
    
    if 'relationships' in data:
        formatted_data['relationships'] = data['relationships']
    
    return formatted_data

def format_web_data(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Format web data for display in the UI."""
    formatted_data = []
    
    for item in data:
        formatted_item = {
            'title': item.get('title', ''),
            'url': item.get('link', ''),
            'snippet': item.get('snippet', '')
        }
        formatted_data.append(formatted_item)
    
    return formatted_data

def format_trading_data(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Format trading topics for display in the UI."""
    formatted_data = []
    
    for topic in data:
        formatted_topic = {
            'name': topic.get('name', ''),
            'description': topic.get('description', ''),
            'books': topic.get('books', [])
        }
        formatted_data.append(formatted_topic)
    
    return formatted_data

def format_location_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Format location book data for display in the UI."""
    formatted_data = {
        'location': data.get('location', ''),
        'categories': []
    }
    
    # Process categories of books
    for category in data.get('categories', []):
        formatted_category = {
            'name': category.get('name', ''),
            'description': category.get('description', ''),
            'books': category.get('books', [])
        }
        formatted_data['categories'].append(formatted_category)
    
    return formatted_data

# New endpoint for integration with the React frontend
@app.route('/api/frontend-chat', methods=['POST'])
def frontend_chat():
    data = request.json
    query = data.get('message', '')
    user_id = data.get('userId', 'USER-1')
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    # Process with the chatbot
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        response = loop.run_until_complete(chatbot.process_message(query))
        
        # Format response to match the structure expected by the frontend
        # The current response format should already be compatible
        
    finally:
        loop.close()
    
    return jsonify(response)

# Add CORS headers to allow cross-origin requests from the React app
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'  # In production, restrict this to your frontend domain
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 