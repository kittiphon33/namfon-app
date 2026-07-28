import React, { useState } from 'react';
import { X, Smartphone, Terminal, Copy, Check, Download, Layers, PlayCircle, ExternalLink } from 'lucide-react';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const buildSteps = [
    {
      step: '1',
      title: 'ติดตั้ง Capacitor Dependencies (ติดตั้งไว้ให้ในโปรเจกต์นี้เรียบร้อยแล้ว)',
      command: 'npm install @capacitor/core @capacitor/android && npm install -D @capacitor/cli',
      desc: 'เพื่อเตรียมระบบสื่อสารระหว่าง Web App (React) และ Native Android Runtime',
    },
    {
      step: '2',
      title: 'สร้างไฟล์ตั้งค่า capacitor.config.json (มีไฟล์ให้แล้วใน Root Directory)',
      command: 'npx cap init "น้ำฝน AI" "com.namfon.ai" --web-dir dist',
      desc: 'ตั้งค่าชื่อแอป "น้ำฝน AI" และ Package ID "com.namfon.ai" ให้ตรงตามโครงสร้าง Android',
    },
    {
      step: '3',
      title: 'Build Web Assets และเพิ่ม Android Platform',
      command: 'npm run build && npx cap add android',
      desc: 'คำสั่งนี้จะคอมไพล์ React/Vite Code ลงโฟลเดอร์ /dist และสร้างโฟลเดอร์ /android สำหรับ Android Studio',
    },
    {
      step: '4',
      title: 'Sync Code ล่าสุดไปยัง Android Project',
      command: 'npx cap sync android',
      desc: 'คัดลอกไฟล์ Build ล่าสุดและ Plugin ไปยัง Android Studio ทุกครั้งที่มีการแก้ไขเว็บ',
    },
    {
      step: '5',
      title: 'เปิดโปรเจกต์ใน Android Studio เพื่อสั่ง Build APK',
      command: 'npx cap open android',
      desc: 'จากนั้นใน Android Studio ให้ไปที่เมนู: Build > Build Bundle(s) / APK(s) > Build APK(s)',
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div id="apk-guide-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div id="apk-guide-card" className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                ขั้นตอนการ Build Android APK ด้วย Capacitor
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  Capacitor Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">แปลงโปรเจกต์ Web App นี้เป็น Android App (.apk) สอดคล้อง capacitor.config.json</p>
            </div>
          </div>

          <button
            id="btn-close-apk-guide"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {/* Config Status Banner */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <Layers className="w-4 h-4" />
              <span>ไฟล์ตั้งค่า `capacitor.config.json` ในโปรเจกต์นี้:</span>
            </div>
            <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-pink-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "appId": "com.namfon.ai",
  "appName": "น้ำฝน AI",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  }
}`}
            </pre>
          </div>

          {/* Step-by-Step Command Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              ขั้นตอนการรันคำสั่งสั่ง Build APK:
            </h4>

            {buildSteps.map((stepItem, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center justify-center text-[10px]">
                      {stepItem.step}
                    </span>
                    <span className="font-semibold text-slate-200 text-xs">{stepItem.title}</span>
                  </div>

                  <button
                    onClick={() => handleCopy(stepItem.command, idx)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] flex items-center gap-1 border border-slate-700"
                    title="ก๊อปปี้คำสั่ง"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-2.5 font-mono text-[11px] text-emerald-300 flex items-center justify-between overflow-x-auto">
                  <code>{stepItem.command}</code>
                </div>

                <p className="text-[11px] text-slate-400">{stepItem.desc}</p>
              </div>
            ))}
          </div>

          {/* Android Studio APK Export Instruction */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 space-y-2 text-emerald-200">
            <h5 className="font-bold flex items-center gap-2 text-emerald-300 text-xs">
              <Download className="w-4 h-4 text-emerald-400" />
              การรับไฟล์ app-debug.apk หลังรันคำสั่งสำเร็จ:
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
              <li>เมื่อสั่ง <code className="text-emerald-400 font-mono">npx cap open android</code> Android Studio จะเปิดขึ้นมา</li>
              <li>รอให้ Gradle Sync เสร็จสมบูรณ์ (สังเกตแถบด้านล่างขวา)</li>
              <li>ไปที่เมนูด้านบน: <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong></li>
              <li>เมื่อระบบ Build เสร็จ จะมีป๊อบอัพขึ้นว่า "APK(s) generated successfully" ให้กดปุ่ม <strong>locate</strong> เพื่อรับไฟล์ <code className="text-pink-300 font-mono">app-debug.apk</code> นำไปติดตั้งในมือถือ Android ได้ทันที!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <PlayCircle className="w-3.5 h-3.5 text-pink-400" />
            ระบบพร้อมสำหรับการ sync APK แล้วค่ะคุณปอนด์!
          </span>

          <button
            id="btn-confirm-apk-guide"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            รับทราบวิธี Build APK
          </button>
        </div>
      </div>
    </div>
  );
};
