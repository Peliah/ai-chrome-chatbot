export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  detectedLanguage?: string;
  summary?: string;
  translation?: {
    text: string;
    language: string;
  };
}

export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
}