'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/app/types';
import { MessageItem } from './message-item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  messages: Message[];
  onSummarize: (messageId: string) => Promise<void>;
  onTranslate: (messageId: string, targetLanguage: string) => Promise<void>;
}

export function MessageList({ messages, onSummarize, onTranslate }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onSummarize={onSummarize}
            onTranslate={onTranslate}
          />
        ))}
      </div>
      <div ref={bottomRef} />
    </ScrollArea>
  );
}