'use client';

import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { MessageSquare } from 'lucide-react';
import { useChatStore } from '@/lib/store';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
declare global {
  interface Window {
    ai: any;
  }
}

export default function Home() {
  const { messages, isProcessing, addMessage, updateMessage, setIsProcessing } = useChatStore();

  /**
 * Detects the language of the given text using the AI language detector.
 * @param {string} text - The text to detect the language of.
 * @returns {Promise<string | null>} - The detected language or null if detection is not possible.
 */
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


  let summarizer: any = null;

  /**
 * Summarizes the given text using the AI summarizer.
 * @param {string} text - The text to summarize.
 * @returns {Promise<ReadableStream | null>} - A readable stream of the summarized text or null if summarization is not possible.
 */
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

    return new ReadableStream({
      async start(controller) {
        let previousLength = 0;

        for await (const segment of stream) {
          const newContent = segment.slice(previousLength);
          controller.enqueue(new TextEncoder().encode(newContent));
          previousLength = segment.length;
        }

        controller.close();
      },
    });
  };

  /**
 * Translates the given text from the source language to the target language using the AI translator.
 * @param {string} text - The text to translate.
 * @param {string} targetLanguage - The target language to translate the text into.
 * @param {string} sourceLanguage - The source language of the text.
 * @returns {Promise<string | null>} - The translated text or null if translation is not possible.
 */
  const translateText = async (text: string, targetLanguage: string, sourceLanguage: string) => {
    const translatorCapabilities = await self.ai.translator.capabilities();
    const availability = translatorCapabilities.languagePairAvailable(sourceLanguage, targetLanguage);
    console.log(availability);
    console.log(sourceLanguage, ' ', targetLanguage);

    if (availability === 'no') {
      toast.error('Translator is unavailable');
      return null;
    } else if (availability === 'after-download') {
      toast.message('Downloading target language "' + targetLanguage + '"')
      let translator = await self.ai.translator.create({
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
    let newText;
    // if (availability === 'readily') {
      console.log('hello');

      let translator = await self.ai.translator.create({
        sourceLanguage: sourceLanguage,
        targetLanguage,
      });
      newText = await translator.translate(text);
      console.log(newText);

    // }

    return newText;
  };

  /**
 * Handles sending a message by detecting its language and adding it to the message list.
 * @param {string} text - The text of the message to send.
 */
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

  /**
 * Handles summarizing a message by updating its summary field with the summarized text.
 * @param {string} messageId - The ID of the message to summarize.
 */
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

  /**
 * Handles translating a message by updating its translation field with the translated text.
 * @param {string} messageId - The ID of the message to translate.
 * @param {string} targetLanguage - The target language to translate the message into.
 */
  const handleTranslate = async (messageId: string, targetLanguage: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    setIsProcessing(true);

    try {
      const detectedLanguage = await detectLanguage(message.text);
      updateMessage(messageId, { detectedLanguage });
      toast.success('Language detected successfully');
      updateMessage(messageId, { translation: { text: '', language: targetLanguage } });

      const translatedText = await translateText(message.text, targetLanguage, detectedLanguage);
      console.log(translatedText);

      updateMessage(messageId, { translation: { text: translatedText, language: targetLanguage } });

      toast.success('Text translated successfully');
    } catch (error) {
      toast.error('Failed to translate message');
      console.error('Error translating message:', error);
    } finally {
      setIsProcessing(false);
    }
  };



  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-8">
      <header className="neo-brutalism bg-primary mb-4 p-4" role="banner">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-8 w-8" aria-hidden="true" />
          <h1 className="text-2xl font-black">Peliah AI Chat Assistant</h1>
        </div>
      </header>
      <ScrollArea className='flex-1 neo-brutalism bg-white mb-4 p-2'>
        <main className="" role="main">
          <MessageList
            messages={messages}
            onSummarize={handleSummarize}
            onTranslate={handleTranslate}
          />

        </main>
      </ScrollArea>
      <footer className="neo-brutalism bg-white" role="contentinfo">
        <MessageInput onSend={handleSendMessage} isProcessing={isProcessing} />
      </footer>
    </div>
  );
}
