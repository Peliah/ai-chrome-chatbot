'use client';

import { v4 as uuidv4 } from 'uuid';
import { Message } from './types';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { MessageSquare } from 'lucide-react';
import { useChatStore } from '@/lib/store';
import { toast } from 'sonner';

declare global {
  interface Window {
    ai: any;
  }
}

export default function Home() {
  const { messages, isProcessing, addMessage, updateMessage, setIsProcessing } = useChatStore();

  // const detectLanguage = async (text: string) => {
  //   const response = await fetch('/api/detect-language', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ text }),
  //   });
  //   if (!response.ok) throw new Error('Failed to detect language');
  //   const data = await response.json();
  //   return data.language;
  // };

  const detectLanguage = async (text: string) => {
    const languageDetectorCapabilities = await self.ai.languageDetector.capabilities();
    const canDetect = languageDetectorCapabilities.available;

    let detector;
    if (canDetect === "no") return null;

    if (canDetect === "readily") {
      detector = await self.ai.languageDetector.create();
    } else {
      detector = await self.ai.languageDetector.create();
      detector.addEventListener("downloadprogress", (e: { loaded: any; total: any; }) => {
        console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
      });
      await detector.ready;
    }

    const detectedLanguage = await detector.detect(text);
    return detectedLanguage[0].detectedLanguage;
  };

  // const summarizeText = async (text: string) => {
  //   const response = await fetch('/api/summarize', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ text }),
  //   });
  //   if (!response.ok) throw new Error('Failed to summarize text');

  //   return response.body; // Return the ReadableStream
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
    if (available === 'no') {
      toast.error('Summarizer is unavailable');
      return null;
    }

    summarizer = await self.ai.summarizer.create(options);
    toast.error('Summarizer is downloading');
    if (available !== 'readily') {
      summarizer.addEventListener('downloadprogress', (e: { loaded: any; total: any; }) => {
        console.log(`Downloaded: ${e.loaded} / ${e.total}`);
      });
      await summarizer.ready;
      toast.success('Summarizer has finished downloading');

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
    const sourceLanguage = await detectLanguage(text);
    const translatorCapabilities = await self.ai.translator.capabilities();
    const availability = translatorCapabilities.languagePairAvailable(sourceLanguage, targetLanguage);

    if (availability === 'no') {
      toast.error('Translator is unavailable');
      return null;
    }

    let translator = await self.ai.translator.create({
      sourceLanguage: sourceLanguage,
      targetLanguage,
    });

    if (availability === 'after-download') {
      toast.message('Downloading target language "' + targetLanguage + '"')
      translator = await self.ai.translator.create({
        sourceLanguage: 'es',
        targetLanguage: 'fr',
        monitor(m: { addEventListener: (arg0: string, arg1: (e: any) => void) => void; }) {
          m.addEventListener('downloadprogress', (e: { loaded: any; total: any; }) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        },
      });
      await translator.ready;
    }

    return await translator.translate(text);
  };

  const handleSendMessage = async (text: string) => {
    setIsProcessing(true);
    const messageId = uuidv4();

    const newMessage: Message = {
      id: messageId,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    addMessage(newMessage);

    try {
      const detectedLanguage = await detectLanguage(text);
      updateMessage(messageId, { detectedLanguage });
      toast.success('Message sent and language detected');
    } catch (error) {
      toast.error('Failed to process message');
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSummarize = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    try {
      updateMessage(messageId, { summary: '' });
      const stream = await summarizeText(message.text);
      if (!stream) return;

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let summary = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        summary += chunk;

        updateMessage(messageId, { summary });
      }

      toast.success('Text summarized successfully');
    } catch (error) {
      toast.error('Failed to summarize text');
      console.error('Error summarizing message:', error);
    }
  };

  const handleTranslate = async (messageId: string, targetLanguage: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    try {
      updateMessage(messageId, { translation: { text: '', language: targetLanguage } });
      const stream = await translateText(message.text, targetLanguage);
      updateMessage(messageId, { translation: { text: stream, language: targetLanguage } });
      toast.success('Text translated successfully');
    } catch (error) {
      toast.error('Failed to translate text');
      console.error('Error translating message:', error);
    }
  };


  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-8">
      <header className="neo-brutalism bg-primary mb-4 p-4" role="banner">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-8 w-8" aria-hidden="true" />
          <h1 className="text-2xl font-black">AI Chat Assistant</h1>
        </div>
      </header>
      <main className="flex-1 neo-brutalism bg-white mb-4" role="main">
        <MessageList
          messages={messages}
          onSummarize={handleSummarize}
          onTranslate={handleTranslate}
        />
      </main>
      <footer className="neo-brutalism bg-white" role="contentinfo">
        <MessageInput onSend={handleSendMessage} isProcessing={isProcessing} />
      </footer>
    </div>
  );
}
