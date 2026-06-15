import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function NexusCore({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffcc" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffcc" />
        
        {active && (
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <CoreObject />
          </Float>
        )}
        
        <DataParticles count={200} />
      </Canvas>
    </div>
  );
}

function CoreObject() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 15]} />
      <MeshDistortMaterial
        color="#00ffcc"
        speed={2}
        distort={0.4}
        radius={1}
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

function DataParticles({ count }: { count: number }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ffcc"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}
