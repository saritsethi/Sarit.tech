import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useGeminiChat } from '@/hooks/use-gemini-chat';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isTyping, error, sendMessage } = useGeminiChat();
  const { trackEvent } = useAnalytics();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    trackEvent(newState ? 'chatbot_opened' : 'chatbot_closed');
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] z-50 rounded-2xl border border-white/10 glass shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-secondary/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">Sarit's Digital Twin</h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Powered by Gemini AI
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleChat}
                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex max-w-[85%] gap-2",
                    msg.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1",
                    msg.role === 'user' ? "bg-white/10" : "bg-primary/20 text-primary"
                  )}>
                    {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-secondary border border-white/5 rounded-tl-sm text-foreground"
                  )}>
                    {msg.content || (msg.role === 'assistant' && <Loader2 className="w-4 h-4 animate-spin opacity-50" />)}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex max-w-[85%] gap-2 self-start">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-primary/20 text-primary">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-white/5 rounded-tl-sm text-foreground flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              {error && (
                <div className="text-xs text-destructive text-center p-2 bg-destructive/10 rounded-lg">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-secondary/50">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isTyping}
                  className="w-full bg-background border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                  data-testid="input-chat"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 p-1.5 bg-primary text-primary-foreground rounded-full disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-all hover:scale-105 active:scale-95"
                  data-testid="button-chat-send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-chat-toggle"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center group"
      >
        <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-20 group-hover:opacity-40"></div>
        {isOpen ? <X className="w-6 h-6 relative z-10" /> : <MessageSquare className="w-6 h-6 relative z-10" />}
      </motion.button>
    </>
  );
}
