import { Suspense, useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

// --- WebGL Scene ---
function EclipseScene({ phase }: { phase: number }) {
  const moonTexture = useTexture('/moon-texture.jpg');
  const moonRef = useRef<THREE.Mesh>(null);
  const blockerRef = useRef<THREE.Mesh>(null);
  const ambientRedRef = useRef<THREE.AmbientLight>(null);
  const { gl } = useThree();

  // Enhance texture clarity for zoom (Anisotropy + Linear filtering)
  useLayoutEffect(() => {
    Object.assign(moonTexture, {
      anisotropy: gl.capabilities.getMaxAnisotropy(),
      minFilter: THREE.LinearMipMapLinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: true,
      needsUpdate: true
    });
  }, [moonTexture, gl]);

  useFrame((_state, delta) => {
    if (moonRef.current) {
      // Subtle constant 3D rotation of the moon
      moonRef.current.rotation.y += delta * 0.05;
    }
    
    // Position of the Earth Shadow Blocker (x moves from right to left)
    // Phase 0: x = 6 (far right)
    // Phase 0.5: x = 0 (center)
    // Phase 1: x = -6 (far left)
    const shadowX = 6 - (phase * 12);
    
    if (blockerRef.current) {
      // Prevent backward shadow sweep when phase loops from 1.0 (left) to 0.0 (right)
      if (Math.abs(blockerRef.current.position.x - shadowX) > 10) {
        blockerRef.current.position.x = shadowX; // Instant snap
      } else {
        // Lerp position for smooth phase transitions
        blockerRef.current.position.x = THREE.MathUtils.lerp(
          blockerRef.current.position.x, 
          shadowX, 
          0.1
        );
      }
    }
    
    // Blood moon glow effect during totality (phase ~ 0.4 to 0.6)
    if (ambientRedRef.current) {
      const distanceToTotality = Math.abs(phase - 0.5);
      let targetRedIntensity = 0;
      if (distanceToTotality < 0.15) {
        // Peaks at intensity 0.8 at exact totality
        targetRedIntensity = (1 - (distanceToTotality / 0.15)) * 0.8;
      }
      ambientRedRef.current.intensity = THREE.MathUtils.lerp(
        ambientRedRef.current.intensity, 
        targetRedIntensity, 
        0.1
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.05} />
      <ambientLight ref={ambientRedRef} color="#ff2200" intensity={0} />
      
      {/* Main sunlight casting shadow */}
      <directionalLight 
        position={[0, 0, 10]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]} // Increased resolution to prevent shadow acne
        shadow-radius={8} // Soft penumbra edges
        shadow-blurSamples={30}
      >
        <orthographicCamera attach="shadow-camera" args={[-3, 3, 3, -3, 1, 20]} />
      </directionalLight>
      
      <group>
        {/* The Moon: Increased segments to 128x128 for perfectly round geometry even at max zoom */}
        <Sphere ref={moonRef} args={[1.5, 128, 128]} receiveShadow rotation={[0, -Math.PI / 2, 0]}>
          <meshStandardMaterial 
            map={moonTexture} 
            roughness={0.9} // Moons are rocky, not shiny
            metalness={0.1}
          />
        </Sphere>

        {/* The Earth Blocker Casting the Eclipse Shadow */}
        {/* We use a standard material so it correctly blocks light, but we don't render it in the camera (visible={false} doesn't cast shadows, so we use colorWrite={false}) */}
        <Sphere 
          ref={blockerRef} 
          args={[2.2, 64, 64]} 
          position={[6, 0, 5]} 
          castShadow 
        >
          {/* colorWrite={false} makes the object completely invisible but still calculates depth/shadows perfectly */}
          <meshStandardMaterial colorWrite={false} depthWrite={true} />
        </Sphere>
      </group>

      {/* Avant-Garde Interaction: Free Rotation & Zoom */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={false}
        dampingFactor={0.05}
        minDistance={1.8} // Prevent clipping inside the moon (radius 1.5)
        maxDistance={10}  // Prevent getting lost in space
      />
    </>
  );
}

// --- Loading Fallback ---
function MoonLoader() {
  return (
    <Html center>
      <div className="text-white/50 font-mono text-xs tracking-[0.3em] uppercase animate-pulse whitespace-nowrap">
        Initializing 3D...
      </div>
    </Html>
  );
}

// --- Main Wrapper ---
interface MoonSphereProps {
  phase: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function MoonSphere({ phase, size = 'md', className }: MoonSphereProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-full h-full max-w-[80vw] max-h-[80vw] md:max-w-[60vw] md:max-h-[60vw]', 
  }[size];

  return (
    <div className={cn('relative flex items-center justify-center cursor-grab active:cursor-grabbing', sizeClasses, className)}>
      {/* Configure dpr for Retina displays (fixes bluriness) */}
      <Canvas shadows camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <Suspense fallback={<MoonLoader />}>
          <EclipseScene phase={phase} />
        </Suspense>
      </Canvas>
    </div>
  );
}
