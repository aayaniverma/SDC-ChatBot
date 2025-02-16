"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Building2, MapPin, GraduationCap, IndianRupee, Calendar, Book } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import WelcomeAnimation from "@/components/WelcomeAnimation";

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChat(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const quickLinks = [
    { 
      icon: GraduationCap, 
      text: "Admission", 
      query: "Tell me about the admission process at Manipal University Jaipur" 
    },
    { 
      icon: IndianRupee, 
      text: "Fees", 
      query: "What are the fee details for different programs at MUJ?" 
    },
    { 
      icon: MapPin, 
      text: "Campus Map", 
      query: "Can you help me navigate the MUJ campus?" 
    },
    { 
      icon: Building2, 
      text: "Hostels", 
      query: "What are the hostel facilities available at MUJ?" 
    },
    { 
      icon: Calendar, 
      text: "Schedule", 
      query: "Tell me about the academic calendar" 
    },
    { 
      icon: Book, 
      text: "Courses", 
      query: "What courses are offered at MUJ?" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {!showChat ? (
        <WelcomeAnimation />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center gap-2 group"
                    onClick={() => setCurrentQuery(link.query)}
                  >
                    <link.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {link.text}
                    </span>
                  </button>
                </motion.div>
              ))}
            </div>
            <ChatInterface currentQuery={currentQuery} setCurrentQuery={setCurrentQuery} />
          </div>
        </motion.div>
      )}
    </div>
  );
}