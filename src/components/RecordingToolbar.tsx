import { useState, useRef } from 'react';
import { Camera, Video, Download, Square, Check, Sparkles } from 'lucide-react';

interface RecordingToolbarProps {
  onCaptureSnapshot?: () => void;
}

export function RecordingToolbar({ onCaptureSnapshot }: RecordingToolbarProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleCapturePhoto = () => {
    const avatarEl = document.getElementById('cyber-dragon-avatar-container');
    if (!avatarEl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const a = document.createElement('a');
    a.download = `CyberDragon_Guardian_${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();

    if (onCaptureSnapshot) onCaptureSnapshot();
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      if (!stream) return;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleDownloadVideo = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.download = `CyberDragon_Clip_${Date.now()}.webm`;
    a.href = url;
    a.click();
  };

  return (
    <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 p-2 rounded-xl backdrop-blur-md shadow-xl text-slate-100">
      <button
        onClick={handleCapturePhoto}
        className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        title="Capture 4K Snapshot"
      >
        <Camera className="w-4 h-4 text-cyan-400" />
        <span className="hidden sm:inline">Snapshot</span>
      </button>

      <button
        onClick={handleToggleRecord}
        className={`p-2.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
          isRecording
            ? 'bg-rose-500 text-white animate-pulse'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
        }`}
      >
        {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Video className="w-4 h-4 text-rose-400" />}
        <span>{isRecording ? `${recordTime}s Recording` : 'Record Clip'}</span>
      </button>

      {recordedBlob && !isRecording && (
        <button
          onClick={handleDownloadVideo}
          className="p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs"
        >
          <Download className="w-4 h-4" />
          <span>Save Clip</span>
        </button>
      )}
    </div>
  );
}
