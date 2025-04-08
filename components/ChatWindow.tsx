"use client";

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import * as XLSX from 'xlsx';

// Add this function at the top of ChatWindow.tsx or import it from a utility file
async function sendMessageToChatbot(userMessage: string) {
  const response = await fetch("http://127.0.0.1:5001/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: userMessage }),
  });

  const data = await response.json();
  return data;
}

async function sendFeedback(question: string, answer: string, feedbackType: string) {
  try {
    console.log('Sending feedback:', { question, answer, feedbackType }); // Debug log
    const response = await fetch("http://127.0.0.1:5001/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        answer,
        feedback_type: feedbackType
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error sending feedback:", error);
  }
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'confirmation' | 'normal' | 'clarification' | 'thank_you';
  feedbackRequested?: boolean;
}

const QuickQueries = [
  "Admission Process",
  "Fee Structure",
  "Course Duration",
  "Placement Statistics",
  "Faculty Information",
  "Infrastructure"
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check if input is a contact query
    const contactQueryMatch = input.trim().toLowerCase().match(/(?:contact|email|phone|details)\s+of\s+(.+)/);
    if (contactQueryMatch) {
      const name = contactQueryMatch[1].trim();
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: 'user',
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const { response, confidence } = await sendMessageToChatbot(input);
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: confidence > 0.6 ? response : `Currently no contact exists for ${name}`,
          sender: 'bot',
          feedbackRequested: confidence > 0.6
        };
        setMessages((prev) => [...prev, botResponse]);
      } catch (error) {
        console.error("Error communicating with the chatbot:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, something went wrong. Please try again later.",
          sender: 'bot',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Add user's message first
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { response, confidence } = await sendMessageToChatbot(input);

      // If confidence is 0.0 and response contains "contact information", it's a name query
      if (confidence === 0.0 && response.includes("contact information")) {
        const clarificationMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          type: 'clarification'
        };
        setMessages((prev) => [...prev, clarificationMessage]);
      } else {
        // Regular response
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          feedbackRequested: confidence > 0.6
        };
        setMessages((prev) => [...prev, botResponse]);
      }
    } catch (error) {
      console.error("Error communicating with the chatbot:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong. Please try again later.",
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = async (query: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { response, confidence } = await sendMessageToChatbot(query);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        feedbackRequested: confidence > 0.6
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error communicating with the chatbot:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong. Please try again later.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = (response: 'yes' | 'no') => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: response === 'yes' ? "Yes, that's correct" : "No, that's not what I meant",
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Get the name from the previous bot message
    const previousBotMessage = messages[messages.length - 1];
    const nameMatch = previousBotMessage.text.match(/for\s+([^?]+)\?/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    // Simulate API response based on confirmation
    setTimeout(async () => {
      if (response === 'yes' && name) {
        // If user confirmed they want contact info, send the actual query
        const { response: contactResponse, confidence } = await sendMessageToChatbot(`contact of ${name}`);
        
        // Show the contact information
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: contactResponse,
          sender: 'bot',
          feedbackRequested: confidence > 0.6
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I apologize for the confusion. Could you please specify what information you're looking for about this person?",
          sender: 'bot'
        };
        setMessages(prev => [...prev, botResponse]);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleFeedback = async (response: 'yes' | 'no', questionMsg: Message, answerMsg: Message) => {
    if (response === 'no') {
      try {
        const response = await fetch('/api/updateExcel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify({
            question: questionMsg.text,
            answer: answerMsg.text,
            timestamp: new Date().toISOString() // Add timestamp to prevent caching
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save feedback');
        }
      } catch (error) {
        console.error('Error saving feedback:', error);
      }
    }

    if (response === 'yes') {
      const thankYouMessage: Message = {
        id: Date.now().toString(),
        text: "Thank you for your contribution! What else can I help you with?",
        sender: 'bot',
        type: 'thank_you'  // Add this type
      };
      setMessages((prev) => [...prev, thankYouMessage]);
    } else if (response === 'no') {
      // Send the actual question and answer texts
      await sendFeedback(questionMsg.text, answerMsg.text, "doubtful");

      // Log for debugging
      console.log('Feedback sent:', {
        question: questionMsg.text,
        answer: answerMsg.text,
        type: 'doubtful'
      });

      const feedbackMessage: Message = {
        id: Date.now().toString(),
        text: "Your feedback has been recorded. Thank you for helping us improve!",
        sender: 'bot',
        type: 'thank_you'  // Add this type
      };
      setMessages((prev) => [...prev, feedbackMessage]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center gap-4">
        <Image
          src="\images\muj logo this.png"
          alt="MUJ Logo"
          width={40}
          height={40}
          className="h-8 w-auto sm:h-10 sm:w-auto md:h-12 md:w-auto lg:h-14 lg:w-auto"
        />
        <Image
          src="\images\sdc-logo-black.webp"
          alt="SDC Logo"
          width={40} // Adjust this if needed
          height={40}
          className="h-8 w-auto sm:h-10 sm:w-auto md:h-12 md:w-auto lg:h-14 lg:w-auto"
        />

        <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl antialiased font-semibold font-serif tracking-wide text-black-600">MUJ CSE ASSISTANT</h1>
      </div>

      {/* Quick Queries */}
      <div className="p-4 flex flex-wrap gap-2 justify-center">
        {QuickQueries.map((query, index) => (
          <motion.button
            key={query}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleQuickQuery(query)}
            className="bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 text-orange-600 border border-orange-200 text-sm md:text-base"
          >
            {query}
          </motion.button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] p-3 md:p-4 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white shadow-md'
              }`}
            >
              <p className="text-sm md:text-base whitespace-pre-line">{message.text}</p>
              {message.type === 'confirmation' && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleFeedback('yes', messages[messages.length - 2], message)}
                    className="bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleFeedback('no', messages[messages.length - 2], message)}
                    className="bg-red-500 text-white px-3 py-1 rounded-full text-sm"
                  >
                    No
                  </button>
                </div>
              )}
              {message.type === 'clarification' && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleConfirmation('yes')}
                    className="text-sm text-gray-500 hover:text-green-500"
                  >
                    👍 Yes
                  </button>
                  <button
                    onClick={() => handleConfirmation('no')}
                    className="text-sm text-gray-500 hover:text-red-500"
                  >
                    👎 No
                  </button>
                </div>
              )}
              {message.sender === 'bot' && !message.type && (  // Only show for bot messages that aren't special types
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleFeedback('yes', messages[index - 1], message)}
                    className="text-sm text-gray-500 hover:text-green-500"
                  >
                    👍 Helpful
                  </button>
                  <button
                    onClick={() => handleFeedback('no', messages[index - 1], message)}
                    className="text-sm text-gray-500 hover:text-red-500"
                  >
                    👎 Not Helpful
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
          />
          <button
            onClick={handleSend}
            className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}