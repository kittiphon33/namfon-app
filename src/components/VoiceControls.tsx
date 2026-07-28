import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Square, RefreshCw, Radio } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface VoiceControlsProps {
  status: ConnectionStatus;
  isMicActive: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  onToggleMic: () => void;
  onToggleMute: () => void;
  onInterrupt: () => void;
  onReconnect: () => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  status,
  isMicActive,
  isMuted,
  isSpeaking,
  onToggleMic,
  onToggleMute,
  onInterrupt,
  onReconnect,
}) => {
  return (
    <div id="voice-controls-container" className="w-full flex flex-col items-center gap-3">
      {/* Main Big Mic Action Button */}
      <div className="relative flex items-center justify-center my-1">
        {/* Glowing aura rings when active */}
        {isMicActive && (
          <>
            <span className="absolute w-24 h-24 rounded-full bg-pink-500/20 animate-ping" />
            <span className="absolute w-20 h-20 rounded-full bg-rose-500/30 animate-pulse" />
          </>
        )}

        <button
          id="btn-toggle-mic-live"
          onClick={onToggleMic}
          disabled={status === 'connecting'}
          className={`relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${
            isMicActive
              ? 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-pink-500/50 scale-105 ring-4 ring-pink-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700 hover:border-pink-500/50 shadow-slate-900/50 hover:scale-105'
          }`}
          title={isMicActive ? 'ปิดไมค์' : 'เปิดไมค์พูดคุย Real-time'}
        >
          {isMicActive ? (
            <Mic className="w-8 h-8 sm:w-9 sm:h-9 animate-pulse text-white" />
          ) : (
            <MicOff className="w-8 h-8 sm:w-9 sm:h-9 text-slate-400 group-hover:text-pink-400" />
          )}
        </button>
      </div>

      {/* Button Status Text Label */}
      <div className="text-center">
        <p className="text-xs font-semibold text-white tracking-wide">
          {isMicActive ? 'ไมค์เปิดอยู่ (คุยเสียงสดกับฝนได้เลย)' : 'แตะปุ่มไมค์เพื่อเริ่มพูดคุยเสียง Real-time'}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {isMicActive ? 'ระบบจะส่ง Audio Stream ตรงถึง Gemini Live API' : 'เอไอจะตอบกลับด้วยเสียงและข้อความภาษาไทยกวนๆ'}
        </p>
      </div>

      {/* Secondary Controls Toolbar */}
      <div id="secondary-audio-toolbar" className="flex items-center gap-2 mt-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-lg">
        {/* Mute output audio */}
        <button
          id="btn-toggle-mute-output"
          onClick={onToggleMute}
          className={`p-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            isMuted
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={isMuted ? 'เปิดเสียงลำโพง' : 'ปิดเสียงลำโพง (ปิดเสียงฝน)'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span className="hidden sm:inline">{isMuted ? 'ปิดเสียงฝนอยู่' : 'เสียงฝนเปิดอยู่'}</span>
        </button>

        {/* Interrupt speaking button if Namfon is talking */}
        {isSpeaking && (
          <button
            id="btn-interrupt-speaking"
            onClick={onInterrupt}
            className="p-2.5 rounded-xl text-xs font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-all flex items-center gap-1.5 animate-pulse"
            title="หยุดให้ฝนพูดก่อน"
          >
            <Square className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>ขัดจังหวะ/ให้ฝนหยุดพูด</span>
          </button>
        )}

        {/* Reconnect button */}
        <button
          id="btn-reconnect-live"
          onClick={onReconnect}
          disabled={status === 'connecting'}
          className="p-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
          title="เชื่อมต่อ Live API ใหม่"
        >
          <RefreshCw className={`w-4 h-4 ${status === 'connecting' ? 'animate-spin text-pink-400' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">เชื่อมต่อใหม่</span>
        </button>
      </div>
    </div>
  );
};
