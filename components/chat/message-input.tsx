'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  isProcessing: boolean;
}

export function MessageInput({ onSend, isProcessing }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;

    await onSend(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="min-h-[80px] neo-brutalism bg-white resize-none"
          disabled={isProcessing}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || isProcessing}
          className="neo-brutalism bg-secondary hover:bg-secondary/90 text-white"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}