import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Visualizer } from './components/Visualizer';
import { ChatFeed } from './components/ChatFeed';
import { VoiceControls } from './components/VoiceControls';
import { PromptChips } from './components/PromptChips';
import { SettingsModal } from './components/SettingsModal';
import { ApkGuideModal } from './components/ApkGuideModal';
import { PCMRecorder, PCMPlayer } from './lib/pcm-audio';
import { ChatMessage, ConnectionStatus } from './types';
import { Send, Mic, Radio, Sparkles } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInputText, setCurrentInputText] = useState('');
  const [currentOutputText, setCurrentOutputText] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [isSendingText, setIsSendingText] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pcmRecorderRef = useRef<PCMRecorder | null>(null);
  const pcmPlayerRef = useRef<PCMPlayer | null>(null);

  // Initialize PCM Player
  useEffect(() => {
    pcmPlayerRef.current = new PCMPlayer();

    // Check volume interval to animate visualizer & detect speaking
    const interval = setInterval(() => {
      if (pcmPlayerRef.current) {
        setIsSpeaking(pcmPlayerRef.current.getIsPlaying());
      }
    }, 100);

    return () => {
      clearInterval(interval);
      pcmPlayerRef.current?.stop();
    };
  }, []);

  // Connect to WebSocket Live API
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('connecting');
    setError(null);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[App] WebSocket Connected');
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'status') {
          setStatus('connected');
        } else if (msg.type === 'audio' && msg.data) {
          if (!isMuted && pcmPlayerRef.current) {
            pcmPlayerRef.current.playChunk(msg.data);
          }
        } else if (msg.type === 'inputTranscription' && msg.text) {
          setCurrentInputText((prev) => (prev ? `${prev} ${msg.text}` : msg.text));
        } else if (msg.type === 'outputTranscription' && msg.text) {
          setCurrentOutputText((prev) => (prev ? `${prev} ${msg.text}` : msg.text));
        } else if (msg.type === 'turnComplete') {
          // Flush input & output transcriptions into messages history
          setCurrentInputText((prevInput) => {
            if (prevInput.trim()) {
              setMessages((prevMsgs) => [
                ...prevMsgs,
                {
                  id: Date.now().toString() + '-user',
                  sender: 'user',
                  text: prevInput.trim(),
                  timestamp: new Date(),
                },
              ]);
            }
            return '';
          });

          setCurrentOutputText((prevOutput) => {
            if (prevOutput.trim()) {
              setMessages((prevMsgs) => [
                ...prevMsgs,
                {
                  id: Date.now().toString() + '-namfon',
                  sender: 'namfon',
                  text: prevOutput.trim(),
                  timestamp: new Date(),
                  isAudio: true,
                },
              ]);
            }
            return '';
          });
        } else if (msg.type === 'interrupted') {
          pcmPlayerRef.current?.interrupt();
          setCurrentOutputText('');
        } else if (msg.type === 'error') {
          setError(msg.error);
          setStatus('error');
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('[App] WebSocket Error:', err);
      setStatus('error');
      setError('ไม่สามารถเชื่อมต่อ WebSocket เซิร์ฟเวอร์ได้');
    };

    ws.onclose = () => {
      console.log('[App] WebSocket Closed');
      setStatus('disconnected');
    };
  }, [isMuted]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // Toggle Live Microphone Audio Streaming
  const handleToggleMic = async () => {
    if (isMicActive) {
      // Stop recording
      pcmRecorderRef.current?.stop();
      pcmRecorderRef.current = null;
      setIsMicActive(false);
    } else {
      // Start recording
      try {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        }

        const recorder = new PCMRecorder((base64PCM) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'audio',
                data: base64PCM,
              })
            );
          }
        });

        await recorder.start();
        pcmRecorderRef.current = recorder;
        setIsMicActive(true);
      } catch (micErr: any) {
        console.error('Microphone permission error:', micErr);
        setError('ไม่สามารถเข้าถึงไมโครโฟนได้: ' + (micErr.message || 'สิทธิ์ปฏิเสธ'));
      }
    }
  };

  // Toggle Mute Output Speaker
  const handleToggleMute = () => {
    if (!isMuted) {
      pcmPlayerRef.current?.interrupt();
    }
    setIsMuted(!isMuted);
  };

  // Interrupt active speech output
  const handleInterrupt = () => {
    pcmPlayerRef.current?.interrupt();
    setCurrentOutputText('');
  };

  // Send Text Message
  const handleSendText = async (textToSend?: string) => {
    const text = (textToSend || typedMessage).trim();
    if (!text || isSendingText) return;

    // Add user message to history
    const userMsgObj: ChatMessage = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsgObj]);
    setTypedMessage('');

    // If WebSocket is open and connected, send via WS
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text }));
      return;
    }

    // Otherwise send via REST /api/chat fallback
    setIsSendingText(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการส่งข้อความ');

      const namfonMsgObj: ChatMessage = {
        id: Date.now().toString() + '-namfon',
        sender: 'namfon',
        text: data.reply,
        timestamp: new Date(),
        isAudio: Boolean(data.audio),
      };
      setMessages((prev) => [...prev, namfonMsgObj]);

      // Play audio response if present
      if (data.audio && !isMuted && pcmPlayerRef.current) {
        pcmPlayerRef.current.playChunk(data.audio);
      }
    } catch (chatErr: any) {
      console.error('Text chat error:', chatErr);
      setError(chatErr.message || 'ส่งข้อความไม่สำเร็จ');
    } finally {
      setIsSendingText(false);
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Header */}
      <Header
        status={status}
        isMicActive={isMicActive}
        isSpeaking={isSpeaking}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenApkGuide={() => setIsApkGuideOpen(true)}
        onClearTranscripts={() => {
          setMessages([]);
          setCurrentInputText('');
          setCurrentOutputText('');
        }}
      />

      {/* Main App Container */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* Audio Wave Visualizer */}
        <Visualizer
          isMicActive={isMicActive}
          isSpeaking={isSpeaking}
          getMicVolume={() => pcmRecorderRef.current?.getVolume() || 0}
          getSpeakerVolume={() => pcmPlayerRef.current?.getVolume() || 0}
        />

        {/* Live Conversation Transcript Feed */}
        <ChatFeed
          messages={messages}
          currentInputText={currentInputText}
          currentOutputText={currentOutputText}
          isSpeaking={isSpeaking}
          isMicActive={isMicActive}
          error={error}
        />

        {/* Quick Sample Prompts */}
        <PromptChips onSelectPrompt={(prompt) => handleSendText(prompt)} />

        {/* Big Mic Controls */}
        <VoiceControls
          status={status}
          isMicActive={isMicActive}
          isMuted={isMuted}
          isSpeaking={isSpeaking}
          onToggleMic={handleToggleMic}
          onToggleMute={handleToggleMute}
          onInterrupt={handleInterrupt}
          onReconnect={connectWebSocket}
        />

        {/* Text Input Footer Bar */}
        <div id="text-input-bar-container" className="w-full mt-1">
          <form
            id="text-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendText();
            }}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-pink-500/80 rounded-2xl p-2 shadow-xl transition-all"
          >
            <input
              id="input-text-message"
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder="พิมพ์ข้อความคุยกับฝนที่นี่ (หรือกดปุ่มไมค์เพื่อพูดคุยสด)..."
              disabled={isSendingText}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
            />

            <button
              id="btn-send-message"
              type="submit"
              disabled={!typedMessage.trim() || isSendingText}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>ส่ง</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      {/* Settings & APK Guide Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ApkGuideModal isOpen={isApkGuideOpen} onClose={() => setIsApkGuideOpen(false)} />
    </div>
  );
}
