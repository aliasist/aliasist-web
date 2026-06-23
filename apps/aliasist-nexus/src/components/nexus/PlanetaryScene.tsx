import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";

import { NexusCore } from "./NexusCore";

export default function PlanetaryScene({ active }: { active: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 8] }}>
      <Suspense fallback={null}>
        <NexusCore active={active} />
        <EffectComposer>
          <Bloom luminanceThreshold={1} intensity={1.5} levels={9} mipmapBlur />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
