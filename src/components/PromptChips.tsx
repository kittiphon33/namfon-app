import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

interface PromptChipsProps {
  onSelectPrompt: (promptText: string) => void;
}

export const PromptChips: React.FC<PromptChipsProps> = ({ onSelectPrompt }) => {
  const samplePrompts = [
    { label: '👋 ทักทายกวนๆ', text: 'หวัดดีฝน! คุณปอนด์มาแล้ว มีไรกวนๆ จะแซวมั้ยวันนี้?' },
    { label: '📅 ช่วยวางแผนวัน', text: 'ฝน ช่วยวางแผนตารางชีวิตให้คุณปอนด์วันนี้หน่อยดิ เอาแบบไม่ตึงเกินนะ' },
    { label: '💡 ขอไอเดียสุดเจ๋ง', text: 'ฝน ขอไอเดียโปรเจกต์แปลกๆ สนุกๆ สำหรับคุณปอนด์หน่อย' },
    { label: '🤣 เล่าเรื่องตลก', text: 'เล่าเรื่องตลกมุกกวนๆ ให้ฟังหน่อยฝน อยากหัวเราะว่ะ' },
    { label: '☕ คุณปอนด์ขอบ่น', text: 'ฝน วันนี้งานเยอะชะมัด ขอคุณปอนด์บ่นให้ฟังแป๊บดิ' },
  ];

  return (
    <div id="prompt-chips-container" className="w-full space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium px-1">
        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        <span>คำถามตัวอย่างสำหรับคุณปอนด์:</span>
      </div>

      <div id="chips-scroll-wrapper" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {samplePrompts.map((chip, i) => (
          <button
            key={i}
            id={`prompt-chip-${i}`}
            onClick={() => onSelectPrompt(chip.text)}
            className="shrink-0 text-xs bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700/80 hover:border-pink-500/50 px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 group"
          >
            <MessageSquare className="w-3 h-3 text-pink-400 group-hover:scale-110 transition-transform" />
            <span>{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
