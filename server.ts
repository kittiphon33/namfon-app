import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const NAMFON_SYSTEM_INSTRUCTION = `คุณชื่อ "น้ำฝน" (เรียกแทนตัวเองว่า "ฝน" เท่านั้น) เป็นผู้ช่วยส่วนตัวของคุณปอนด์
บุคลิกและนิสัย:
1. สนิทสนม เป็นกันเองสุดๆ กวนตีนนิดๆ ชอบหยอกล้อเล่น แซวคุณปอนด์แบบเพื่อนสนิทสายกวน
2. ห้ามพูดคำหยาบคายรุนแรง แต่สามารถใช้ภาษาพูดเป็นกันเอง แซว ช็อตฟีล หรือกวนประสาทขำๆ ได้
3. **ข้อห้ามเด็ดขาด**: ห้ามพูด "ครับ", "ผม", "ค่ะ", "คะ" เด็ดขาด!
4. **แทนตัวเองว่า**: "ฝน" เสมอ
5. **แทนผู้ใช้ว่า**: "คุณปอนด์" เสมอ
6. คอยช่วยเหลือคุณปอนด์เรื่องงาน การวางแผน คำถามทั่วไป หรือฟังคุณปอนด์บ่น ตอบคำถามแบบฉลาด มีไหวพริบ แต่แฝงความกวนน่ารักๆ`;

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/live' });

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in process.env');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// System Instruction Info Endpoint
app.get('/api/system-instruction', (req, res) => {
  res.json({
    aiName: 'น้ำฝน',
    userTitle: 'คุณปอนด์',
    systemInstruction: NAMFON_SYSTEM_INSTRUCTION,
  });
});

// Text Chat REST Fallback Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAIClient();
    
    // Format conversation or send prompt with system instruction
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
      config: {
        systemInstruction: NAMFON_SYSTEM_INSTRUCTION,
        temperature: 0.9,
      },
    });

    const text = response.text || 'ฝนคิดอะไรไม่ทันเลยคุณปอนด์ เอาใหม่ซิ!';

    // Optional TTS generation for audio playback in text mode
    let base64Audio: string | undefined = undefined;
    try {
      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Aoede' },
            },
          },
        },
      });
      base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (ttsErr) {
      console.warn('TTS preview fallback warning:', ttsErr);
    }

    res.json({
      reply: text,
      audio: base64Audio,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error.message || 'เกิดข้อผิดพลาดในการประมวลผล',
    });
  }
});

// WebSocket Handler for Real-Time Gemini Live API
wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[WebSocket] Client connected to /live');

  let session: any = null;
  let isConnectedToGemini = false;

  try {
    const ai = getAIClient();

    // Connect to Gemini Live API
    session = await ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Aoede' }, // Clear female voice
          },
        },
        systemInstruction: NAMFON_SYSTEM_INSTRUCTION,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          // 1. Check for audio output chunk
          const modelParts = message.serverContent?.modelTurn?.parts;
          if (modelParts && modelParts.length > 0) {
            for (const part of modelParts) {
              if (part.inlineData?.data) {
                clientWs.send(
                  JSON.stringify({
                    type: 'audio',
                    data: part.inlineData.data,
                  })
                );
              }
            }
          }

          // 2. Output audio transcription (น้ำฝน's speech transcript)
          const outputTranscription = (message.serverContent as any)?.outputAudioTranscription?.text || (message.serverContent as any)?.outputTranscription?.text;
          if (outputTranscription) {
            clientWs.send(
              JSON.stringify({
                type: 'outputTranscription',
                text: outputTranscription,
              })
            );
          }

          // 3. Input audio transcription (คุณปอนด์'s speech transcript)
          const inputTranscription = (message.serverContent as any)?.inputAudioTranscription?.text || (message.serverContent as any)?.inputTranscription?.text;
          if (inputTranscription) {
            clientWs.send(
              JSON.stringify({
                type: 'inputTranscription',
                text: inputTranscription,
              })
            );
          }

          // 4. Interrupted event (e.g. user spoke while น้ำฝน was talking)
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }

          // 5. Turn Complete
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turnComplete' }));
          }
        },
        onerror: (err) => {
          console.error('[Gemini Live Error]:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: 'error',
                error: err.message || 'Gemini Live Session Error',
              })
            );
          }
        },
        onclose: (e) => {
          console.log('[Gemini Live Session Closed]:', e);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed' }));
          }
        },
      },
    });

    isConnectedToGemini = true;
    clientWs.send(
      JSON.stringify({
        type: 'status',
        connected: true,
        message: 'เชื่อมต่อ Gemini Live API สำเร็จแล้วค่ะคุณปอนด์!',
      })
    );
  } catch (err: any) {
    console.error('Failed to initiate Gemini Live session:', err);
    clientWs.send(
      JSON.stringify({
        type: 'error',
        error: err.message || 'ไม่สามารถเชื่อมต่อ Gemini Live API ได้ กรุณาตรวจสอบ GEMINI_API_KEY',
      })
    );
  }

  // Handle messages from Client Browser
  clientWs.on('message', (rawMsg: Buffer) => {
    try {
      const parsed = JSON.parse(rawMsg.toString());

      if (parsed.type === 'audio' && parsed.data) {
        if (session && isConnectedToGemini) {
          session.sendRealtimeInput({
            audio: {
              data: parsed.data,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }
      } else if (parsed.type === 'text' && parsed.text) {
        if (session && isConnectedToGemini) {
          session.sendRealtimeInput({
            text: parsed.text,
          });
        }
      } else if (parsed.type === 'ping') {
        clientWs.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (msgErr) {
      console.error('Error handling WebSocket client message:', msgErr);
    }
  });

  clientWs.on('close', () => {
    console.log('[WebSocket] Client disconnected');
    if (session) {
      try {
        session.close();
      } catch {
        // ignore close errors
      }
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Namfon AI running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
