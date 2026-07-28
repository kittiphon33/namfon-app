import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isMicActive: boolean;
  isSpeaking: boolean;
  getMicVolume: () => number;
  getSpeakerVolume: () => number;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  isMicActive,
  isSpeaking,
  getMicVolume,
  getSpeakerVolume,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const micVol = isMicActive ? getMicVolume() : 0;
      const speakVol = isSpeaking ? getSpeakerVolume() : 0;
      const activeVol = Math.max(micVol, speakVol);

      phase += 0.08;

      // Base line when idle
      if (!isMicActive && !isSpeaking) {
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let x = 0; x < width; x += 5) {
          const y = centerY + Math.sin(x * 0.02 + phase) * 2;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#334155'; // slate-700
        ctx.lineWidth = 1.5;
        ctx.stroke();
        animationId = requestAnimationFrame(render);
        return;
      }

      // Draw active multi-wave lines
      const waveCount = 3;
      const colors = isSpeaking
        ? ['rgba(244, 63, 94, 0.8)', 'rgba(236, 72, 153, 0.6)', 'rgba(251, 146, 60, 0.4)'] // Rose/Pink/Orange for Namfon
        : ['rgba(16, 185, 129, 0.8)', 'rgba(56, 189, 248, 0.6)', 'rgba(168, 85, 247, 0.4)']; // Emerald/Sky/Purple for Khun Pond

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.moveTo(0, centerY);

        const amplitude = (activeVol * 40 + 10) * (1 - w * 0.25);
        const frequency = 0.015 + w * 0.005;

        for (let x = 0; x < width; x += 4) {
          // Windowing curve to taper wave edges smoothly
          const edgeFactor = Math.sin((x / width) * Math.PI);
          const y = centerY + Math.sin(x * frequency + phase + w) * amplitude * edgeFactor;
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = colors[w];
        ctx.lineWidth = 2.5 - w * 0.5;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isMicActive, isSpeaking, getMicVolume, getSpeakerVolume]);

  return (
    <div id="visualizer-container" className="w-full bg-slate-950/80 rounded-2xl p-3 border border-slate-800 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
      <div id="visualizer-status-overlay" className="absolute top-2 left-3 flex items-center gap-2 text-[11px] font-medium text-slate-400">
        {isSpeaking ? (
          <span className="flex items-center gap-1.5 text-pink-400">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            น้ำฝนกำลังพูดตอบ...
          </span>
        ) : isMicActive ? (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            กำลังฟังเสียงคุณปอนด์...
          </span>
        ) : (
          <span className="text-slate-500">คลิกปุ่มไมค์ด้านล่างเพื่อเริ่มคุยกับฝน</span>
        )}
      </div>

      <canvas
        id="audio-wave-canvas"
        ref={canvasRef}
        width={600}
        height={70}
        className="w-full h-16 max-w-xl"
      />
    </div>
  );
};
