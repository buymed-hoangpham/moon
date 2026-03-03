import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GlobalControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onJumpToPhase: (phase: number) => void;
  className?: string;
}

export function GlobalControls({
  isPlaying,
  onTogglePlay,
  onStop,
  onJumpToPhase,
  className
}: GlobalControlsProps) {
  return (
    <div className={cn(
      "glass rounded-2xl px-6 py-4 flex flex-col items-center gap-4",
      className
    )}>
      
      <div className="flex items-center justify-between w-full gap-8">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-white/10 text-white"
            onClick={onTogglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-white/10 text-white"
            onClick={onStop}
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        </div>

        {/* Phase Jumpers */}
        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
          <Button variant="ghost" size="sm" onClick={() => onJumpToPhase(0.0)} className="text-xs h-7 rounded-full text-white/70 hover:text-white px-3">FULL</Button>
          <Button variant="ghost" size="sm" onClick={() => onJumpToPhase(0.35)} className="text-xs h-7 rounded-full text-white/70 hover:text-white px-3">PARTIAL</Button>
          <Button variant="ghost" size="sm" onClick={() => onJumpToPhase(0.5)} className="text-xs h-7 rounded-full text-white/70 hover:text-white px-3 text-[#5b2bee] hover:text-[#7c4dff] font-medium">TOTALITY</Button>
        </div>
      </div>
    </div>
  );
}
