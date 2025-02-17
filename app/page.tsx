'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatState } from './types';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { MessageSquare } from 'lucide-react';

export default function Home() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isProcessing: false,
  });

  const detectLanguage = async (text: string) => {
    const response = await fetch('/api/detect-language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return data.language;
  };

  const summarizeText = async (text: string) => {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return data.summary;
  };

  const translateText = async (text: string, targetLanguage: string) => {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage }),
    });
    const data = await response.json();
    return data.translation;
  };

  const handleSendMessage = async (text: string) => {
    setChatState((prev) => ({
      ...prev,
      isProcessing: true,
    }));

    const messageId = uuidv4();
    const newMessage: Message = {
      id: messageId,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    try {
      const detectedLanguage = await detectLanguage(text);

      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId
            ? { ...msg, detectedLanguage }
            : msg
        ),
      }));
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setChatState((prev) => ({
        ...prev,
        isProcessing: false,
      }));
    }
  };

  const handleSummarize = async (messageId: string) => {
    const message = chatState.messages.find((m) => m.id === messageId);
    if (!message) return;

    try {
      const summary = await summarizeText(message.text);
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId ? { ...msg, summary } : msg
        ),
      }));
    } catch (error) {
      console.error('Error summarizing message:', error);
    }
  };

  const handleTranslate = async (messageId: string, targetLanguage: string) => {
    const message = chatState.messages.find((m) => m.id === messageId);
    if (!message) return;

    try {
      const translatedText = await translateText(message.text, targetLanguage);
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId
            ? {
              ...msg,
              translation: {
                text: translatedText,
                language: targetLanguage,
              },
            }
            : msg
        ),
      }));
    } catch (error) {
      console.error('Error translating message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-8">
      <header className="neo-brutalism bg-primary mb-4 p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          <h1 className="text-2xl font-black">Peliah&apos;s Chrome AI Chat Assistant</h1>
        </div>
      </header>
      <main className="flex-1 neo-brutalism bg-white mb-4">
        <MessageList
          messages={chatState.messages}
          onSummarize={handleSummarize}
          onTranslate={handleTranslate}
        />
      </main>
      <footer className="neo-brutalism bg-white">
        <MessageInput
          onSend={handleSendMessage}
          isProcessing={chatState.isProcessing}
        />
      </footer>
    </div>
  );
}