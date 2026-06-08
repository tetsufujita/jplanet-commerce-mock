"use client";

import { MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { useReducedMotion } from "@/components/cinematic/MotionGate";

function CrystalForm() {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useReducedMotion();

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    group.rotation.x += dt * 0.1;
    group.rotation.y += dt * 0.13;
    group.rotation.z += dt * 0.04;
    group.position.y = Math.sin(t * 0.45) * 0.18;

    // Scroll-driven scale + drift
    const scroll = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, scroll / max));
    const targetScale = 1 + Math.sin(p * Math.PI) * 0.18;
    const current = group.scale.x;
    group.scale.setScalar(current + (targetScale - current) * Math.min(dt * 1.5, 1));
  });

  return (
    <group ref={groupRef}>
      {/* Outer iridescent shell — high-poly icosahedron */}
      <mesh>
        <icosahedronGeometry args={[1.2, 4]} />
        <MeshTransmissionMaterial
          anisotropicBlur={0.4}
          backside
          backsideThickness={1.2}
          chromaticAberration={1}
          color="#ffffff"
          distortion={0.6}
          distortionScale={0.3}
          ior={1.5}
          iridescence={1}
          iridescenceIOR={1.4}
          iridescenceThicknessRange={[100, 1200]}
          samples={6}
          temporalDistortion={0.2}
          thickness={2.4}
          transmission={0.96}
        />
      </mesh>

      {/* Inner crystal core — smaller, slightly offset, different rotation */}
      <mesh position={[0.15, -0.1, 0.05]} rotation={[0.4, 0.7, 0]}>
        <octahedronGeometry args={[0.6, 2]} />
        <MeshTransmissionMaterial
          backside
          chromaticAberration={0.8}
          color="#b8d8ff"
          distortion={0.4}
          ior={1.6}
          iridescence={0.7}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[200, 800]}
          samples={3}
          thickness={1.1}
          transmission={0.9}
        />
      </mesh>

      {/* Thin orbiting ring */}
      <mesh rotation={[Math.PI / 2.4, 0, 0.6]}>
        <torusGeometry args={[1.65, 0.018, 16, 128]} />
        <meshBasicMaterial color="#ffffff" opacity={0.42} transparent />
      </mesh>
    </group>
  );
}

export function IridescentCentrepiece() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[2] flex items-center justify-center">
      <div className="h-[80vh] w-[80vh] max-h-[820px] max-w-[820px]">
        <Canvas
          camera={{ fov: 35, near: 0.1, far: 50, position: [0, 0, 5.2] }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 5, 6]} intensity={1.6} />
          <directionalLight position={[-5, -3, 4]} intensity={0.9} color="#a3c8ff" />
          <pointLight position={[0, 3, 3]} intensity={1.2} color="#ffd2a6" />
          <CrystalForm />
          <Sparkles
            color="#ffffff"
            count={80}
            opacity={0.65}
            scale={[5, 5, 3] as unknown as number}
            size={1.8}
            speed={0.25}
          />
        </Canvas>
      </div>
    </div>
  );
}
