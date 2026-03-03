import { Play, Pause } from 'lucide-react';
import { MoonSphere } from './MoonSphere';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MoonInstance {
  id: string;
  isLocal: boolean; // True if detached from global timeline
  localPhase: number; // Phase if detached
  isPlayingLocal: boolean; // True if playing locally while detached
}

interface MoonCardProps {
  instance: MoonInstance;
  globalPhase: number;
  onPhaseChange: (id: string, newPhase: number) => void;
  onTogglePlay: (id: string) => void;
}

export function MoonCard({ instance, globalPhase, onPhaseChange, onTogglePlay }: MoonCardProps) {
  const currentPhase = instance.isLocal ? instance.localPhase : globalPhase;

  // Derive title from phase
  const getPhaseName = (p: number) => {
    if (p < 0.1 || p > 0.9) return "FULL MOON";
    if (p > 0.45 && p < 0.55) return "TOTALITY";
    if (p <= 0.45) return "WAXING ECLIPSE";
    return "WANING ECLIPSE";
  };

  const syncStateLabel = instance.isLocal ? "LOCAL" : "SYNCED";

  return (
    <Card className={cn(
      "relative overflow-hidden flex flex-col items-center justify-between p-6 transition-all duration-300",
      "glass border border-white/5",
      instance.isLocal ? "glass-active" : ""
    )}>
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-6 text-xs tracking-[0.2em] text-white/50">
        <span>{syncStateLabel}</span>
        <span className={instance.isLocal ? 'text-[#5b2bee]' : 'text-white'}>
          {getPhaseName(currentPhase)}
        </span>
      </div>

      {/* The 3D Moon */}
      <div className="flex-1 flex items-center justify-center max-w-full aspect-square w-full">
        <MoonSphere phase={currentPhase} size="md" className="w-full h-auto max-w-[200px]" />
      </div>

      {/* Micro Controls */}
      <div className="w-full flex items-center gap-4 mt-8 z-10 w-full">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/20 text-white shrink-0"
          onClick={() => onTogglePlay(instance.id)}
        >
          {instance.isLocal && instance.isPlayingLocal ? (
            <Pause className="h-3 w-3 fill-current" />
          ) : (
            <Play className="h-3 w-3 fill-current" />
          )}
        </Button>
        
        {/* Slider wrapped in a pad to ensure WCAG hit target size, visually ultra-thin */}
        <div className="flex-1 py-3 group">
          <Slider
            defaultValue={[currentPhase]}
            value={[currentPhase]}
            max={1}
            step={0.001}
            onValueChange={(vals) => onPhaseChange(instance.id, vals[0])}
            className="cursor-grab active:cursor-grabbing"
          />
        </div>
      </div>
    </Card>
  );
}
