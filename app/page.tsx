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

  // const detectLanguage = async (text: string) => {
  //   // const response = await fetch('/api/detect-language', {
  //   //   method: 'POST',
  //   //   headers: { 'Content-Type': 'application/json' },
  //   //   body: JSON.stringify({ text }),
  //   // });
  //   // const data = await response.json();
  //   // return data.language;


  // };
  const detectLanguage = async (text: string) => {
    const languageDetectorCapabilities = await self.ai.languageDetector.capabilities();
    const canDetect = languageDetectorCapabilities.available; // Fix: Correct property

    let detector;
    if (canDetect === "no") return null; // No detection possible

    if (canDetect === "readily") {
      detector = await self.ai.languageDetector.create();
    } else {
      detector = await self.ai.languageDetector.create();
      detector.addEventListener("downloadprogress", (e) => {
        console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
      });
      await detector.ready;
    }

    const detectedLanguage = await detector.detect(text); // ✅ Now it actually detects!
    return detectedLanguage[0].detectedLanguage;
  };

  // const summarizeText = async (text: string) => {
  //   // const response = await fetch('/api/summarize', {
  //   //   method: 'POST',
  //   //   headers: { 'Content-Type': 'application/json' },
  //   //   body: JSON.stringify({ text }),
  //   // });
  //   const options = {
  //     sharedContext: 'This is a project document',
  //     type: 'key-points',
  //     format: 'markdown',
  //     length: 'medium',
  //   };

  //   const available = (await self.ai.summarizer.capabilities()).available;
  //   let summarizer;
  //   if (available === 'no') {
  //     // The Summarizer API isn't usable.
  //     return;
  //   }
  //   if (available === 'readily') {
  //     // The Summarizer API can be used immediately .
  //     summarizer = await self.ai.summarizer.create(options);
  //   } else {
  //     // The Summarizer API can be used after the model is downloaded.
  //     summarizer = await self.ai.summarizer.create(options);
  //     summarizer.addEventListener('downloadprogress', (e) => {
  //       console.log(e.loaded, e.total);
  //     });
  //     await summarizer.ready;
  //   }

  //   // const summary = await summarizer.summarize(text, {
  //   //   context: 'This article is intended for a tech-savvy audience.',
  //   // });
  //   const stream = await summarizer.summarizeStreaming(text, {
  //     context: 'This article is intended for a tech-savvy audience.',
  //   });

  //   // Process the streamed response correctly
  //   let result = '';
  //   let previousLength = 0;

  //   for await (const segment of stream) {
  //     const newContent = segment.slice(previousLength);
  //     console.log(newContent);
  //     previousLength = segment.length;
  //     result += newContent;
  //   }

  //   console.log('Final Summary:', result);
  //   return result;

  //   // const data = await response.json();
  //   // return data.summary;
  // };

  let summarizer: any = null;

  const summarizeText = async (text: string) => {
    const options = {
      sharedContext: 'This is a project document',
      type: 'key-points',
      format: 'markdown',
      length: 'medium',
    };

    const available = (await self.ai.summarizer.capabilities()).available;
    if (available === 'no') return null;

    summarizer = await self.ai.summarizer.create(options);
    if (available !== 'readily') {
      summarizer.addEventListener('downloadprogress', (e) => {
        console.log(`Downloaded: ${e.loaded} / ${e.total}`);
      });
      await summarizer.ready;
    }

    const stream = await summarizer.summarizeStreaming(text, {
      context: 'This article is intended for a tech-savvy audience.',
    });

    // Create a ReadableStream to pass data incrementally
    return new ReadableStream({
      async start(controller) {
        let previousLength = 0;

        for await (const segment of stream) {
          const newContent = segment.slice(previousLength);
          controller.enqueue(new TextEncoder().encode(newContent)); // Send chunk
          previousLength = segment.length;
        }

        controller.close(); // Close stream when done
      },
    });
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
          msg.id === messageId ? { ...msg, detectedLanguage } : msg
        ),
      }));
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setChatState((prev) => ({
        ...prev,
        isProcessing: false,
      }));
    }
  };

  // const handleSummarize = async (messageId: string) => {
  //   const message = chatState.messages.find((m) => m.id === messageId);
  //   if (!message) return;

  //   try {
  //     const summary = await summarizeText(message.text);
  //     setChatState((prev) => ({
  //       ...prev,
  //       messages: prev.messages.map((msg) =>
  //         msg.id === messageId ? { ...msg, summary } : msg
  //       ),
  //     }));
  //   } catch (error) {
  //     console.error('Error summarizing message:', error);
  //   }
  // };

  const handleSummarize = async (messageId: string) => {
    const message = chatState.messages.find((m) => m.id === messageId);
    if (!message) return;

    try {
      // Clear previous summary before starting
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId ? { ...msg, summary: "" } : msg
        ),
      }));

      const stream = await summarizeText(message.text);
      if (!stream) return;

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let summary = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        summary += chunk;

        // Update state progressively as chunks arrive
        setChatState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === messageId ? { ...msg, summary } : msg
          ),
        }));
      }
    } catch (error) {
      console.error("Error summarizing message:", error);
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