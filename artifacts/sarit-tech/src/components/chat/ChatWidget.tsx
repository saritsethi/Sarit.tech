import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useGeminiChat } from '@/hooks/use-gemini-chat';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isTyping, error, sendMessage } = useGeminiChat();
  const { trackEvent } = useAnalytics();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      {/* Full-screen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ backdropFilter: 'blur(16px)', backgroundColor: 'rgba(15,23,42,0.92)' }}
          >
            {/* Grid pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(45,212,191,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.04) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />

            {/* Close button top-right */}
            <button
              onClick={toggleChat}
              className="absolute top-6 right-6 p-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all z-10"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Chat container */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-2xl mx-4 flex flex-col rounded-3xl border border-white/10 bg-background/80 shadow-2xl overflow-hidden"
              style={{ height: 'min(650px, calc(100vh - 80px))' }}
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 bg-secondary/50 flex items-center gap-4 flex-shrink-0">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">Sarit's Digital Twin</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                    Powered by Gemini AI · Ask me anything
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex max-w-[85%] gap-3',
                      msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start',
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mt-1',
                        msg.role === 'user'
                          ? 'bg-white/10'
                          : 'bg-primary/20 text-primary',
                      )}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'p-4 rounded-2xl text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-secondary border border-white/5 rounded-tl-sm text-foreground',
                      )}
                    >
                      {msg.content || (
                        msg.role === 'assistant' && (
                          <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                        )
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex max-w-[85%] gap-3 self-start">
                    <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 bg-primary/20 text-primary">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary border border-white/5 rounded-tl-sm text-foreground flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-xs text-destructive text-center p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                    {error}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 bg-secondary/50 flex-shrink-0">
                <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about AI strategy, leadership, or projects..."
                    disabled={isTyping}
                    className="flex-1 bg-background border border-white/10 rounded-2xl pl-5 pr-14 py-3.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                    data-testid="input-chat"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-40 disabled:bg-muted disabled:text-muted-foreground transition-all hover:scale-105 active:scale-95"
                    data-testid="button-chat-send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Brain Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        data-testid="button-chat-toggle"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center group"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <div className="absolute inset-0 rounded-2xl bg-primary/40 animate-ping opacity-20 group-hover:opacity-40" />
        <Brain className="w-6 h-6 relative z-10" />
      </motion.button>
    </>
  );
}
