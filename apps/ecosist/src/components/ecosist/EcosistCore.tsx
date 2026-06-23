import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function EcosistCore({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#00ffcc" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#34d399" />
      
      {active && (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh ref={meshRef}>
            <icosahedronGeometry args={[2.2, 1]} />
            <meshStandardMaterial
              color="#00ffcc"
              wireframe
              transparent
              opacity={0.15}
            />
          </mesh>
          
          <Sphere args={[2, 64, 64]}>
            <MeshDistortMaterial
              color="#05080a"
              speed={1.2}
              distort={0.3}
              radius={1}
              metalness={0.9}
              roughness={0.1}
            />
          </Sphere>
        </Float>
      )}
      
      <DataParticles count={150} />
    </>
  );
}

function DataParticles({ count }: { count: number }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      p[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = radius * Math.cos(phi);
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.03;
      ref.current.rotation.z = state.clock.elapsedTime * 0.01;
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
        size={0.03}
        color="#34d399"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
