export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'namfon';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  isAudio?: boolean;
}

export interface LiveState {
  status: ConnectionStatus;
  isMicActive: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  currentInputText: string;
  currentOutputText: string;
  error: string | null;
}

export interface SystemInstructionConfig {
  aiName: string;
  userTitle: string;
  personality: string;
  customRules: string[];
}
