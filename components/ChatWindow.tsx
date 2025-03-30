"use client";

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'confirmation' | 'normal';
}

const QuickQueries = [
  "Admission Process",
  "Fee Structure",
  "Course Duration",
  "Placement Statistics",
  "Faculty Information",
  "Infrastructure"
];

// Simulated backend responses
const mockResponses: Record<string, string> = {
  "Admission Process": "The admission process at MUJ CSE involves: 1. JEE Mains score consideration 2. Online application 3. Merit list declaration 4. Counseling rounds. Would you like more specific details about any of these steps?",
  "Fee Structure": "The annual fee structure for B.Tech CSE program is approximately ₹3.25 lakhs per year. This includes tuition fees, development fees, and other charges. Would you like a detailed breakdown?",
  "Course Duration": "The B.Tech CSE program at MUJ is a 4-year undergraduate course spread across 8 semesters. Each semester includes core subjects, electives, and practical labs.",
  "Placement Statistics": "For the 2023 batch, CSE department achieved: 1. 95% placement rate 2. Average package of 8.5 LPA 3. Highest package of 45 LPA 4. Top recruiters include Microsoft, Amazon, and Google.",
  "Faculty Information": "The CSE department has over 100 faculty members, including: 1. 40+ PhD holders 2. Industry experts 3. Research scholars. Would you like to know about specific faculty members or areas of expertise?",
  "Infrastructure": "MUJ CSE department features: 1. Modern computer labs 2. Research centers 3. Innovation hub 4. 24/7 internet facility 5. Specialized labs for AI, IoT, and Cybersecurity."
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
    };
  
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
  
    // Check if user input matches any predefined responses
    const lowerInput = input.toLowerCase();
    const tempResponses: Record<string, string> = {
      "programs offer": "1. B. Tech (Computer Science & Engineering)\n 2. M. Tech (Computer Science & Engineering)",
      "eligibility criteria for admission": "1. MET 2024 Rank Holders:\n The candidate must have passed 10+2 or A Level or IB or American 12th grade or equivalent examination with Physics, Mathematics and English as Compulsory subjects, along with any one of Chemistry or Computer Science or Biotechnology or Biology or Statistics or Engineering Drawing as optional subject for admission to B Tech, with minimum of 50% marks in Physics, Mathematics and the optional subject, put together.\n2. Direct admission:\nDirect admission is possible if seats are available after MET.\nCandidates need to meet one of the following criteria:\n-Candidates have a JEE rank and qualified for JEE Advanced in that year\n-Based on candidate's SAT score\n-MET 2024 rank holders, who could not come for counseling.\n-All Students with Physics, Mathematics and English as compulsory subjects and who have 60% or equivalent in PMX subjects in their 12th std. where X could be Chemistry, Computers Science, Biotechnology, Biology, Statistics or Engineering Drawing.",
      "duration of m.tech": "The M.Tech program at MUJ has a duration of 2 years (4 semesters)."
    };
  
    let botResponseText = "I'm not sure about that. Did you mean to ask about the admission process?";
    let responseType: 'confirmation' | 'normal' = 'confirmation'; // Default to confirmation
  
    for (const key in tempResponses) {
      if (lowerInput.includes(key)) {
        botResponseText = tempResponses[key];
        responseType = 'normal'; // Set as normal to avoid showing confirmation buttons
        break;
      }
    }
  
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        type: responseType
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickQuery = (query: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API response with mock data
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: mockResponses[query] || "I'll get that information for you shortly.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleConfirmation = (response: 'yes' | 'no') => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: response === 'yes' ? "Yes, that's correct" : "No, that's not what I meant",
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API response based on confirmation
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response === 'yes' 
          ? mockResponses["Admission Process"]
          : "I apologize for the confusion. Could you please rephrase your question?",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
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
          className="h-10 w-auto"
        />
        <Image
          src="\images\sdc-logo-black.webp"
          alt="SDC Logo"
          width={40} // Adjust this if needed
          height={40}
          className="h-10 w-auto"
        />

        <h1 className="text-xl antialiased font-semibold font-serif tracking-wide text-black-600">MUJ CSE ASSISTANT</h1>
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
        {messages.map((message) => (
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
                    onClick={() => handleConfirmation('yes')}
                    className="bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleConfirmation('no')}
                    className="bg-red-500 text-white px-3 py-1 rounded-full text-sm"
                  >
                    No
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