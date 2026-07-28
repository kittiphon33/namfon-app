import React, { useEffect, useRef } from 'react';
import { Bot, User, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatFeedProps {
  messages: ChatMessage[];
  currentInputText: string;
  currentOutputText: string;
  isSpeaking: boolean;
  isMicActive: boolean;
  error: string | null;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  messages,
  currentInputText,
  currentOutputText,
  isSpeaking,
  isMicActive,
  error,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentInputText, currentOutputText, error]);

  return (
    <div id="chat-feed-container" className="flex-1 overflow-y-auto space-y-4 p-4 min-h-[320px] max-h-[500px] rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
      {/* Welcome Banner if no messages */}
      {messages.length === 0 && !currentInputText && !currentOutputText && (
        <div id="chat-welcome-banner" className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 my-auto">
          <div id="namfon-banner-avatar" className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-500 p-0.5 shadow-xl shadow-pink-500/20 mb-4 animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-pink-400">
              <Bot className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">
            "ฝนพร้อมคุยแล้วค่ะคุณปอนด์!"
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
            กดเปิดไมโครโฟน แล้วพูดคุยแบบ Real-time Stream เสียงตอบโต้ได้เลย หรือจะพิมพ์ทักทายกวนๆ มาก็ได้นะ!
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-[11px]">
            <span className="bg-pink-500/10 text-pink-300 border border-pink-500/20 px-3 py-1 rounded-full">
              ✨ ไม่พูดครับ/ค่ะ
            </span>
            <span className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1 rounded-full">
              💅 แทนตัวเองว่า "ฝน"
            </span>
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full">
              ⚡ Audio Real-time Stream
            </span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div id="chat-error-banner" className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-3 text-rose-300 text-xs shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">ข้อผิดพลาดในการเชื่อมต่อ:</p>
            <p className="mt-0.5 text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Messages List */}
      {messages.map((msg) => {
        const isNamfon = msg.sender === 'namfon';

        return (
          <div
            key={msg.id}
            id={`message-bubble-${msg.id}`}
            className={`flex items-start gap-3 ${isNamfon ? 'justify-start' : 'justify-end'}`}
          >
            {/* Namfon Avatar */}
            {isNamfon && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 p-0.5 shrink-0 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-pink-400">
                  <Bot className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Bubble Content */}
            <div
              className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm shadow-md leading-relaxed ${
                isNamfon
                  ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
                  : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-tr-none'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1 text-[11px] opacity-80">
                <span className="font-semibold flex items-center gap-1">
                  {isNamfon ? (
                    <>
                      <span>น้ำฝน</span>
                      <Sparkles className="w-3 h-3 text-amber-300 inline" />
                    </>
                  ) : (
                    'คุณปอนด์'
                  )}
                </span>
                <span className="text-[10px] opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.isAudio && isNamfon && (
                <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center gap-1 text-[11px] text-pink-300">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>ตอบด้วยเสียงสด (Gemini Live Stream)</span>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {!isNamfon && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 p-0.5 shrink-0 flex items-center justify-center text-slate-300 border border-slate-600 shadow-md">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      })}

      {/* Active User Input Transcription (Real-time STT as Khun Pond speaks) */}
      {currentInputText && (
        <div id="live-user-transcription-bubble" className="flex items-start gap-3 justify-end">
          <div className="max-w-[82%] sm:max-w-[75%] rounded-2xl p-3 text-sm bg-pink-900/40 border border-pink-500/30 text-pink-100 rounded-tr-none animate-pulse">
            <div className="text-[11px] font-semibold text-pink-300 mb-1 flex items-center gap-1">
              <span>คุณปอนด์ (กำลังพูด...)</span>
            </div>
            <p className="italic">{currentInputText}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-pink-600/30 p-0.5 shrink-0 flex items-center justify-center text-pink-300 border border-pink-500/40">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Active Namfon Output Transcription (Real-time STT as Namfon speaks) */}
      {currentOutputText && (
        <div id="live-namfon-transcription-bubble" className="flex items-start gap-3 justify-start">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 p-0.5 shrink-0 shadow-md animate-spin-slow">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-pink-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm bg-slate-800 text-slate-100 border border-pink-500/40 rounded-tl-none shadow-lg">
            <div className="text-[11px] font-semibold text-pink-400 mb-1 flex items-center gap-1">
              <span>น้ำฝน (กำลังพูดสด...)</span>
              <Volume2 className="w-3.5 h-3.5 animate-bounce text-pink-400" />
            </div>
            <p className="whitespace-pre-wrap">{currentOutputText}</p>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
