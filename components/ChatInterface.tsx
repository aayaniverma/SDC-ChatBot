"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot } from "lucide-react";

interface Message {
  text: string;
  isBot: boolean;
}

interface ChatInterfaceProps {
  currentQuery: string;
  setCurrentQuery: (query: string) => void;
}

const RESPONSES = {
  "Tell me about the admission process at Manipal University Jaipur": 
    "The admission process at MUJ involves:\n1. Online application submission\n2. Entrance exam (if applicable)\n3. Document verification\n4. Fee payment\nFor specific programs, please visit the official website or contact the admissions office.",
  
  "What are the fee details for different programs at MUJ?":
    "Fee structure varies by program:\n- B.Tech: ₹2.5-3.5L per year\n- BBA: ₹2-2.5L per year\n- B.Arch: ₹2.8-3.2L per year\nPlease note these are approximate figures. Contact the fee department for exact details.",
  
  "Can you help me navigate the MUJ campus?":
    "MUJ campus has clearly marked buildings and directions:\n- Academic Block (A-F)\n- Central Library\n- Student Center\n- Sports Complex\n- Hostels\nYou can get a printed map from the information desk at the main entrance.",
  
  "What are the hostel facilities available at MUJ?":
    "MUJ offers excellent hostel facilities:\n- Separate hostels for boys and girls\n- AC/Non-AC rooms\n- 24/7 security\n- Mess facility\n- Wi-Fi connectivity\n- Laundry service\n- Medical facility",
  
  "Tell me about the academic calendar":
    "The academic year typically includes:\n- Odd Semester: July-December\n- Even Semester: January-May\n- Mid-semester breaks\n- Winter and Summer vacations\nCheck the official website for exact dates.",
  
  "What courses are offered at MUJ?":
    "MUJ offers various programs:\n- Engineering (B.Tech, M.Tech)\n- Management (BBA, MBA)\n- Architecture (B.Arch)\n- Design (B.Des)\n- Law (LLB, LLM)\n- Sciences\n- Humanities\nVisit the website for a complete list of courses."
};

export default function ChatInterface({ currentQuery, setCurrentQuery }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your MUJ assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentQuery) {
      handleSend(currentQuery);
      setCurrentQuery("");
    }
  }, [currentQuery]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text, isBot: false }]);

    // Simulate bot response
    setTimeout(() => {
      const response = RESPONSES[text as keyof typeof RESPONSES] || 
        "I'm still learning about that. Please contact the university administration for accurate information.";
      
      setMessages((prev) => [
        ...prev,
        {
          text: response,
          isBot: true,
        },
      ]);
    }, 1000);

    setInput("");
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-4 bg-blue-600 dark:bg-blue-800">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-white" />
          <h2 className="text-xl font-semibold text-white">MUJ Assistant</h2>
        </div>
      </div>

      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line ${
                  message.isBot
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    : "bg-blue-600 text-white"
                }`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSend()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}