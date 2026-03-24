import { useState, useCallback } from 'react';

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
      content: "Hi, I'm Sarit's Digital Twin. Ask me anything about his experience in construction tech, enterprise AI strategy, or product leadership!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMsgId = Date.now().toString();
      setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content }]);
      setIsTyping(true);
      setError(null);

      const assistantMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '' },
      ]);

      try {
        const baseUrl = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
        const response = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            ...(conversationId ? { conversationId } : {}),
          }),
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
                if (data.conversationId && !conversationId) {
                  setConversationId(data.conversationId);
                }
                if (data.done) break;
                if (data.content) {
                  assistantResponse += data.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, content: assistantResponse }
                        : msg,
                    ),
                  );
                }
              } catch {
                // ignore malformed SSE chunks
              }
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while communicating with the twin.');
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant' && !lastMsg.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsTyping(false);
      }
    },
    [conversationId],
  );

  return { messages, isTyping, error, sendMessage };
}
