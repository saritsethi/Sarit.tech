import { useState, useRef, useCallback } from 'react';
import { useCreateGeminiConversation } from '@workspace/api-client-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useGeminiChat() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi, I'm Sarit's Digital Twin. Ask me anything about his experience in construction tech, enterprise AI strategy, or product leadership!"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConv = useCreateGeminiConversation();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content }]);
    setIsTyping(true);
    setError(null);

    try {
      let currentConvId = conversationId;
      
      // Create conversation if it doesn't exist
      if (!currentConvId) {
        const conv = await createConv.mutateAsync({ data: { title: 'Chat Session' } });
        currentConvId = conv.id;
        setConversationId(conv.id);
      }

      // Add a placeholder for the assistant's response
      const assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

      // Fetch the SSE stream
      const response = await fetch(`/api/gemini/conversations/${currentConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to the AI Digital Twin.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                // Stream complete
                break;
              }
              if (data.content) {
                assistantResponse += data.content;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMsgId ? { ...msg, content: assistantResponse } : msg
                  )
                );
              }
            } catch (e) {
              console.error('Error parsing SSE chunk', e);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while communicating with the twin.');
      // Remove the empty assistant message placeholder if it failed completely
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.role === 'assistant' && !lastMsg.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsTyping(false);
    }
  }, [conversationId, createConv]);

  return {
    messages,
    isTyping,
    error,
    sendMessage
  };
}
