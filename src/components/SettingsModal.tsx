import React from 'react';
import { X, Bot, ShieldCheck, CheckCircle2, User, Mic, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="settings-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div id="settings-modal-card" className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-pink-400">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                การตั้งค่าเอไอ "น้ำฝน"
                <Sparkles className="w-4 h-4 text-amber-400 inline" />
              </h3>
              <p className="text-xs text-slate-400">System Instruction & Voice Configuration</p>
            </div>
          </div>

          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Parameters */}
        <div className="space-y-4 text-xs">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-pink-400 font-semibold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                กฎ System Instruction บังคับใช้
              </span>
              <span className="bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2.5 py-0.5 rounded-md text-[10px]">
                เปิดใช้งานแล้ว
              </span>
            </div>

            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ชื่อเอไอ:</strong> น้ำฝน (แทนตัวเองว่า <strong>"ฝน"</strong> เท่านั้น)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>สรรพนามเรียกผู้ใช้:</strong> <strong>"คุณปอนด์"</strong> เท่านั้น
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>คำห้ามเด็ดขาด:</strong> ไม่พูดคำว่า <strong>"ครับ", "ผม", "ค่ะ", "คะ"</strong> เด็ดขาด
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>นิสัยและบุคลิก:</strong> เป็นผู้ช่วยส่วนตัว สนิทสนม กวนตีนนิดๆ ชอบหยอกล้อ ช็อตฟีลขำๆ แบบเพื่อนสนิท
                </span>
              </li>
            </ul>
          </div>

          {/* Model & Audio Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Bot className="w-3.5 h-3.5 text-pink-400" />
                <span>Gemini Live Model</span>
              </div>
              <p className="text-slate-200 font-mono text-[11px]">gemini-3.1-flash-live-preview</p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio Streaming</span>
              </div>
              <p className="text-slate-200 text-[11px]">In: 16kHz PCM | Out: 24kHz PCM</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            id="btn-confirm-settings"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium text-xs shadow-lg shadow-pink-500/20 transition-all"
          >
            เข้าใจแล้วคุณปอนด์
          </button>
        </div>
      </div>
    </div>
  );
};
