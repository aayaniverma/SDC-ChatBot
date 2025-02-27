"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Bot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const ChatWindow = dynamic(() => import('@/components/ChatWindow'), {
  loading: () => <div>Loading...</div>
});

const WelcomeAnimation = dynamic(() => import('@/components/WelcomeAnimation'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleChatOpen = () => {
    setIsChatOpen(true);
    // Show welcome animation for 3 seconds
    setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-image">
      <Image 
        src="/images/bg.png" 
        width={800} 
        height={500} 
        alt="Background Image"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
      {/* Main content */}
      <div className="max-w-7xl mx-auto p-8">
      </div>

      {/* Chatbot */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl w-full max-w-3xl h-[80vh] relative overflow-hidden"
            >
              <button
                onClick={() => setIsChatOpen(false)}
                className="absolute right-4 top-4 z-50"
              >
                <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
              </button>

              {showWelcome ? (
                <WelcomeAnimation />
              ) : (
                <ChatWindow />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleChatOpen}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full p-4 shadow-lg z-40"
      >
        <Bot className="h-6 w-6 text-white" />
      </motion.button>
    </div>
  );
}