import { useState, useEffect, useRef } from 'react';
import { MoonSphere } from './components/MoonSphere';
import { GlobalControls } from './components/GlobalControls';

export default function App() {
  const [globalPhase, setGlobalPhase] = useState(0.0);
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
  
  // Slower animation speed for cinematic feel
  const ANIMATION_SPEED = 0.00015;

  // Animation Loop
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current != null) {
        const deltaTime = time - lastTimeRef.current;
        const increment = deltaTime * ANIMATION_SPEED;

        if (isGlobalPlaying) {
          setGlobalPhase(prev => {
            let next = prev + increment;
            if (next > 1) next = 0; // loop
            return next;
          });
        }
      }
      
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    // Only run animation frame if something is playing
    if (isGlobalPlaying) {
        if (!requestRef.current) {
           requestRef.current = requestAnimationFrame(animate);
        }
    } else {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = undefined;
            lastTimeRef.current = undefined;
        }
    }
    
    return () => {
      if (requestRef.current) {
         cancelAnimationFrame(requestRef.current);
         requestRef.current = undefined;
      }
    };
  }, [isGlobalPlaying]);

  // Handle Global Controls
  const toggleGlobalPlay = () => setIsGlobalPlaying(!isGlobalPlaying);
  const stopGlobal = () => {
    setIsGlobalPlaying(false);
    setGlobalPhase(0);
  };

  const handleJumpToPhase = (phase: number) => {
    setGlobalPhase(phase);
    // Optionally pause when jumping so the user can inspect it
    setIsGlobalPlaying(false);
  };

  // Header Title
  const getPhaseName = (p: number) => {
    if (p < 0.1 || p > 0.9) return "FULL MOON";
    if (p > 0.45 && p < 0.55) return "TOTALITY";
    if (p <= 0.45) return "WAXING ECLIPSE";
    return "WANING ECLIPSE";
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-between p-6 lg:p-12 overflow-hidden selection:bg-white/10">
      
      {/* Background Starry Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-[#5b2bee]/5 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-start md:items-center z-10 gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-[0.3em] text-white">ECLIPSE // NEXUS</h1>
          <p className="text-xs tracking-widest text-white/40 mt-1 uppercase">Avant-Garde Simulation</p>
        </div>
        <div className="font-mono text-sm tracking-widest text-white/70">
          PHASE: {getPhaseName(globalPhase)} - {Math.round(globalPhase * 100)}%
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl flex items-center justify-center relative z-10 mt-8 mb-24">
        {/* Single Giant Moon View */}
        <div className="flex flex-col items-center justify-center w-full h-full relative">
          <MoonSphere phase={globalPhase} size="xl" className="w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] max-w-[600px] max-h-[600px]" />
          
          {/* Romantic Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-rose-200 drop-shadow-[0_0_25px_rgba(255,192,203,0.8)] animate-pulse tracking-wide select-none mix-blend-screen">
              Hoàng <span className="text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] mx-2 md:mx-4">❤️</span> Nhi
            </h2>
          </div>
        </div>
      </main>

      {/* Floating Global Controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <GlobalControls
          isPlaying={isGlobalPlaying}
          onTogglePlay={toggleGlobalPlay}
          onStop={stopGlobal}
          onJumpToPhase={handleJumpToPhase}
        />
      </div>
    </div>
  );
}
