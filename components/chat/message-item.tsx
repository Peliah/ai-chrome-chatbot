'use client';

import { Message } from '@/app/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  onSummarize: (messageId: string) => Promise<void>;
  onTranslate: (messageId: string, targetLanguage: string) => Promise<void>;
}

export function MessageItem({ message, onSummarize, onTranslate }: MessageItemProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleTranslate = async () => {
    if (!selectedLanguage) return;
    setIsTranslating(true);
    await onTranslate(message.id, selectedLanguage);
    setIsTranslating(false);
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    await onSummarize(message.id);
    setIsSummarizing(false);
  };

  return (
    <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} mb-6`}>
      <div
        className={`max-w-[80%] p-4 ${
          message.sender === 'user'
            ? 'neo-brutalism-secondary bg-secondary text-secondary-foreground'
            : 'neo-brutalism-accent bg-accent text-accent-foreground'
        }`}
      >
        <p className="whitespace-pre-wrap font-medium">{message.text}</p>
        {message.detectedLanguage && (
          <p className="text-sm mt-2 font-bold">
            Detected Language: {message.detectedLanguage}
          </p>
        )}
        {message.summary && (
          <div className="mt-2 p-2 bg-white/90 neo-brutalism border-2">
            <p className="text-sm font-black text-black">Summary:</p>
            <p className="text-sm font-medium text-black">{message.summary}</p>
          </div>
        )}
        {message.translation && (
          <div className="mt-2 p-2 bg-white/90 neo-brutalism border-2">
            <p className="text-sm font-black text-black">
              Translation ({message.translation.language}):
            </p>
            <p className="text-sm font-medium text-black">{message.translation.text}</p>
          </div>
        )}
      </div>
      {message.sender === 'user' && message.text.length > 150 && !message.summary && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="neo-brutalism bg-white hover:bg-white/90"
          >
            {isSummarizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Summarize
          </Button>
        </div>
      )}
      {message.sender === 'user' && (
        <div className="mt-2 flex gap-2">
          <Select onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[120px] neo-brutalism bg-white">
              <SelectValue placeholder="Translate to" />
            </SelectTrigger>
            <SelectContent className="neo-brutalism">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="ru">Russian</SelectItem>
              <SelectItem value="tr">Turkish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTranslate}
            disabled={!selectedLanguage || isTranslating}
            className="neo-brutalism bg-white hover:bg-white/90"
          >
            {isTranslating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Translate
          </Button>
        </div>
      )}
    </div>
  );
}