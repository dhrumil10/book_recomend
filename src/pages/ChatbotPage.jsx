import React, { useState, useRef, useEffect } from 'react';
import { Send, Book, ArrowRight, User, Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import TopNavigation from '../Components/TopNavigation';
import chatbotService from '../services/chatbotService';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: 'Hello! I\'m your BookLovers assistant. I can help you discover new books, answer questions about authors, genres, and make personalized recommendations based on your reading history and preferences. What would you like to know today?'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookResults, setBookResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  const handleSend = async () => {
    if (input.trim() === '') return;
    
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowResults(false);
    setIsLoading(true);
    
    try {
      // Get response from Graph RAG
      const response = await chatbotService.processMessage(input);
      
      const botMessage = {
        id: messages.length + 2,
        type: 'system',
        content: response.content
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Handle different response types
      if (response.type === 'recommendations' && response.data) {
        setBookResults(response.data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        type: 'system',
        content: "I'm sorry, I encountered an error while processing your request. Please try again with a different question."
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Auto-scroll to the most recent message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-16">
      <TopNavigation title="BookBot" />
      
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-xl mx-auto">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-xl p-3 ${
                  message.type === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white shadow rounded-tl-none'
                }`}
              >
                <div className="flex mb-2">
                  {message.type === 'system' ? (
                    <div className="bg-indigo-100 w-6 h-6 rounded-full flex items-center justify-center">
                      <Book className="h-3 w-3 text-indigo-600" />
                    </div>
                  ) : (
                    <div className="bg-white w-6 h-6 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-indigo-600" />
                    </div>
                  )}
                  <div className="text-xs ml-2 mt-1">
                    {message.type === 'system' ? 'BookBot' : 'You'}
                  </div>
                </div>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {message.type === 'system' && (
                  <div className="flex justify-end mt-2">
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-1 ml-1">
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white shadow rounded-xl rounded-tl-none p-4 max-w-[80%] flex items-center">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <div className="ml-3 text-sm text-gray-500">Searching knowledge graph...</div>
              </div>
            </div>
          )}
          
          {showResults && bookResults.length > 0 && (
            <div className="bg-white shadow rounded-lg p-4 mb-4">
              <div className="text-sm font-semibold mb-2">Recommended Books:</div>
              <div className="space-y-3">
                {bookResults.map(book => (
                  <div key={book.id} className="flex items-center">
                    <div className={`bg-blue-200 w-12 h-16 rounded flex-shrink-0`}></div>
                    <div className="ml-3 flex-1">
                      <div className="font-semibold text-sm">{book.title}</div>
                      <div className="text-xs text-gray-500">{book.author || "Unknown Author"}</div>
                      <div className="text-xs text-indigo-600 mt-1">{book.matchScore}% match</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {book.ISBN && `ISBN: ${book.ISBN}`}
                      </div>
                    </div>
                    <button className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="bg-white border-t p-3 fixed bottom-16 left-0 right-0">
        <div className="max-w-xl mx-auto flex items-center">
          <div className="flex-1 bg-gray-100 rounded-full flex items-center pl-4 pr-1 py-1">
            <input
              type="text"
              placeholder="Ask me about books, authors, or get recommendations..."
              className="bg-transparent outline-none w-full text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className={`p-2 rounded-full ${input.trim() ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}
              onClick={handleSend}
              disabled={input.trim() === ''}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;