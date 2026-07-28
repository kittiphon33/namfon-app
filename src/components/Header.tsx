import React from 'react';
import { Sparkles, Mic, Volume2, Settings, Trash2, Bot, Circle, Smartphone } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface HeaderProps {
  status: ConnectionStatus;
  isMicActive: boolean;
  isSpeaking: boolean;
  onOpenSettings: () => void;
  onOpenApkGuide: () => void;
  onClearTranscripts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  isMicActive,
  isSpeaking,
  onOpenSettings,
  onOpenApkGuide,
  onClearTranscripts,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span id="status-badge-connected" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Gemini Live พร้อมแล้ว
          </span>
        );
      case 'connecting':
        return (
          <span id="status-badge-connecting" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Circle className="w-2 h-2 animate-ping text-amber-400" />
            กำลังเชื่อมต่อ...
          </span>
        );
      case 'error':
        return (
          <span id="status-badge-error" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            ข้อผิดพลาดการเชื่อมต่อ
          </span>
        );
      default:
        return (
          <span id="status-badge-offline" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            สแตนด์บาย (ยังไม่เล่นเสียง)
          </span>
        );
    }
  };

  return (
    <header id="app-header" className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div id="header-container" className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left branding */}
        <div id="header-branding" className="flex items-center gap-3">
          <div id="namfon-avatar-badge" className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-0.5 shadow-lg shadow-pink-500/20">
            <div id="namfon-avatar-inner" className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-pink-400">
              <Bot className="w-6 h-6" />
            </div>
            {isSpeaking && (
              <span id="speaking-indicator-dot" className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white ring-2 ring-slate-950 animate-bounce">
                <Volume2 className="w-2.5 h-2.5" />
              </span>
            )}
            {isMicActive && !isSpeaking && (
              <span id="listening-indicator-dot" className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white ring-2 ring-slate-950">
                <Mic className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 id="app-title" className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                น้ำฝน (Namfon AI)
                <Sparkles className="w-4 h-4 text-amber-400 inline" />
              </h1>
              {getStatusBadge()}
            </div>
            <p id="app-subtitle" className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>ผู้ช่วยส่วนตัวกวนๆ ของคุณปอนด์</span>
              <span className="text-slate-600">•</span>
              <span className="text-pink-400 font-medium">แทนตัวเองว่า "ฝน"</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-300">ไม่พูดครับ/ค่ะ</span>
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div id="header-actions" className="flex items-center gap-2">
          <button
            id="btn-open-apk-guide"
            onClick={onOpenApkGuide}
            className="p-2 text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/60 rounded-xl transition-all text-xs flex items-center gap-1.5 border border-emerald-500/30"
            title="วิธี Build Android APK ด้วย Capacitor"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-medium">Build APK</span>
          </button>

          <button
            id="btn-clear-chat"
            onClick={onClearTranscripts}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all text-xs flex items-center gap-1.5 border border-slate-800 hover:border-slate-700"
            title="ล้างข้อความประวัติ"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">ล้างประวัติ</span>
          </button>

          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-xs flex items-center gap-1.5 border border-slate-700"
            title="ตั้งค่า System Instruction"
          >
            <Settings className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline font-medium">ตั้งค่าเอไอ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
