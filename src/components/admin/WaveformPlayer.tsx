import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RefreshCw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WaveformPlayerProps {
  recordingSid: string;
  recordingDuration?: number | null;
}

const WAVEFORM_BARS = 50;

export function WaveformPlayer({ recordingSid, recordingDuration }: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recordingDuration || 0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const { toast } = useToast();

  // Generate waveform data from audio buffer
  const generateWaveform = useCallback(async (arrayBuffer: ArrayBuffer) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer.slice(0));
      const channelData = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(channelData.length / WAVEFORM_BARS);
      const waveform: number[] = [];
      
      for (let i = 0; i < WAVEFORM_BARS; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        waveform.push(sum / blockSize);
      }
      
      // Normalize
      const max = Math.max(...waveform);
      const normalized = waveform.map(v => v / max);
      setWaveformData(normalized);
    } catch (error) {
      console.error("Failed to generate waveform:", error);
      // Generate placeholder waveform
      const placeholder = Array(WAVEFORM_BARS).fill(0).map(() => 0.3 + Math.random() * 0.7);
      setWaveformData(placeholder);
    }
  }, []);

  const loadAudio = async () => {
    if (audioUrl) return audioUrl;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twilio-call-recording?recordingSid=${recordingSid}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load recording");
      }

      const arrayBuffer = await response.arrayBuffer();
      await generateWaveform(arrayBuffer.slice(0));
      
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      return url;
    } catch (error) {
      console.error("Failed to load recording:", error);
      toast({
        title: "Failed to load recording",
        description: "The recording could not be loaded. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const url = await loadAudio();
    if (!url) return;

    if (audioRef.current) {
      if (!audioRef.current.src) {
        audioRef.current.src = url;
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || !duration) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !audioRef.current || !duration) return;
    handleSeek(e);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
  };

  const skipForward = () => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
  };

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / WAVEFORM_BARS - 2;
    const playedBars = duration > 0 ? Math.floor((currentTime / duration) * WAVEFORM_BARS) : 0;

    ctx.clearRect(0, 0, width, height);

    // Draw bars
    const data = waveformData.length > 0 ? waveformData : Array(WAVEFORM_BARS).fill(0.15);
    
    data.forEach((value, index) => {
      const barHeight = Math.max(4, value * (height - 8));
      const x = index * (barWidth + 2) + 1;
      const y = (height - barHeight) / 2;
      
      // Use CSS custom properties for theming
      if (index < playedBars) {
        ctx.fillStyle = "hsl(142, 76%, 36%)"; // primary green played
      } else if (index === playedBars) {
        ctx.fillStyle = "hsl(142, 76%, 50%)"; // current position
      } else {
        ctx.fillStyle = "hsl(215, 20%, 65%)"; // muted unplayed
      }
      
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    });
  }, [waveformData, currentTime, duration]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 min-w-[280px]">
      {/* Skip Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={skipBackward}
        disabled={isLoading || !audioUrl}
        className="h-7 w-7 p-0"
        title="Back 5s"
      >
        <SkipBack className="h-3 w-3" />
      </Button>

      {/* Play/Pause */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlay}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Skip Forward */}
      <Button
        variant="ghost"
        size="sm"
        onClick={skipForward}
        disabled={isLoading || !audioUrl}
        className="h-7 w-7 p-0"
        title="Forward 5s"
      >
        <SkipForward className="h-3 w-3" />
      </Button>

      {/* Waveform */}
      <div className="flex-1 flex items-center gap-2">
        <canvas
          ref={canvasRef}
          className="h-8 w-full cursor-pointer rounded"
          onClick={handleSeek}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ minWidth: "120px" }}
        />
        
        {/* Time display */}
        <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[70px] text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <audio ref={audioRef} className="hidden" preload="none" />
    </div>
  );
}
