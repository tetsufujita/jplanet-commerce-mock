"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { useReducedMotion } from "@/components/cinematic/MotionGate";

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uPaintOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uGlow;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.03;
      amplitude *= 0.48;
    }

    return value;
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = vUv * aspect;
    vec2 centered = (vUv - 0.5) * aspect;
    vec2 mouse = uMouse * aspect;

    float drift = fbm(uv * 2.2 + vec2(uTime * 0.035, -uTime * 0.025));
    float veil = smoothstep(0.08, 0.92, vUv.y + drift * 0.18);
    float cursor = smoothstep(0.28, 0.0, distance(uv, mouse));
    float pulse = smoothstep(0.92, 0.12, length(centered + vec2(0.0, 0.18)));

    vec3 color = mix(uColorA, uColorB, veil);
    color = mix(color, uGlow, cursor * (0.32 + drift * 0.22));
    color += pulse * vec3(0.04, 0.025, 0.015);

    float grain = noise(vUv * uResolution.xy * 0.65 + uTime);
    color += (grain - 0.5) * 0.045;

    gl_FragColor = vec4(color, uPaintOpacity);
  }
`;

type CssPalette = {
  colorA: string;
  colorB: string;
  glow: string;
};

const fallbackPalette: CssPalette = {
  colorA: "rgb(6, 11, 31)",
  colorB: "rgb(255, 138, 60)",
  glow: "rgb(232, 62, 92)",
};

function getModeOpacity(mode: "network" | "paint") {
  const section = document.querySelector(`[data-webgl-mode="${mode}"]`);

  if (!(section instanceof HTMLElement)) {
    return 0;
  }

  const rect = section.getBoundingClientRect();
  const viewport = window.innerHeight;
  const center = viewport * 0.5;
  const distance = Math.min(Math.abs(rect.top - center), Math.abs(rect.bottom - center));

  if (rect.bottom < 0 || rect.top > viewport) {
    return 0;
  }

  return Math.max(0, Math.min(1, 1 - distance / viewport));
}

function readPalette(): CssPalette {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;

  return {
    colorA: read("--color-andes-midnight", fallbackPalette.colorA),
    colorB: read("--color-andes-dawn", fallbackPalette.colorB),
    glow: read("--color-andes-glow", fallbackPalette.glow),
  };
}

function useShouldRenderWebGL() {
  const reducedMotion = useReducedMotion();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setShouldRender(false);
      return;
    }

    setShouldRender(!window.matchMedia("(max-width: 768px)").matches);
  }, [reducedMotion]);

  return shouldRender;
}

function PaintPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointerTargetRef = useRef(new THREE.Vector2(0.5, 0.5));
  const pointerCurrentRef = useRef(new THREE.Vector2(0.5, 0.5));
  const paletteRef = useRef<CssPalette>(fallbackPalette);
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uTime: { value: 0 },
      uPaintOpacity: { value: 1 },
      uColorA: { value: new THREE.Color() },
      uColorB: { value: new THREE.Color() },
      uGlow: { value: new THREE.Color() },
    }),
    [size.height, size.width],
  );

  useEffect(() => {
    paletteRef.current = readPalette();

    const handlePointerMove = (event: PointerEvent) => {
      pointerTargetRef.current.set(
        event.clientX / window.innerWidth,
        1 - event.clientY / window.innerHeight,
      );
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame(({ clock }) => {
    if (!materialRef.current) {
      return;
    }

    const paintOpacity = Math.max(getModeOpacity("paint"), getModeOpacity("network") * 0.36);

    pointerCurrentRef.current.lerp(pointerTargetRef.current, 0.085);
    uniforms.uMouse.value.copy(pointerCurrentRef.current);
    uniforms.uResolution.value.set(size.width, size.height);
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uPaintOpacity.value = paintOpacity;
    uniforms.uColorA.value.set(paletteRef.current.colorA);
    uniforms.uColorB.value.set(paletteRef.current.colorB);
    uniforms.uGlow.value.set(paletteRef.current.glow);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}

function NetworkLayer() {
  const groupRef = useRef<THREE.Group>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const pointMaterialRef = useRef<THREE.PointsMaterial>(null);
  const { viewport } = useThree();

  const pointPositions = useMemo(
    () =>
      new Float32Array([
        -2.8, 1.1, 0,
        -1.8, -1.3, 0,
        2.7, 1.2, 0,
        0, 0, 0,
        1.15, -1.35, 0,
      ]),
    [],
  );

  const linePositions = useMemo(
    () =>
      new Float32Array([
        -2.8, 1.1, 0,
        0, 0, 0,
        -1.8, -1.3, 0,
        0, 0, 0,
        2.7, 1.2, 0,
        0, 0, 0,
        1.15, -1.35, 0,
        0, 0, 0,
      ]),
    [],
  );

  useFrame(({ clock, pointer }) => {
    const opacity = getModeOpacity("network");

    if (groupRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.018 + opacity * 0.05;
      groupRef.current.visible = opacity > 0.02;
      groupRef.current.rotation.z = pointer.x * 0.035;
      groupRef.current.rotation.x = -pointer.y * 0.035;
      groupRef.current.scale.setScalar(pulse * Math.min(viewport.width / 6.5, 1.35));
    }

    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = opacity * 0.56;
    }

    if (pointMaterialRef.current) {
      pointMaterialRef.current.opacity = opacity;
      pointMaterialRef.current.size = 0.09 + opacity * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMaterialRef} transparent color="#14F195" opacity={0} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pointPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={pointMaterialRef}
          transparent
          color="#14F195"
          depthWrite={false}
          opacity={0}
          size={0.12}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export function CinematicBackdrop() {
  const shouldRenderWebGL = useShouldRenderWebGL();

  if (!shouldRenderWebGL) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_24%_20%,color-mix(in_oklab,var(--color-andes-dawn)_26%,transparent),transparent_38%),linear-gradient(145deg,var(--color-andes-midnight),var(--color-andes-dawn))]"
      />
    );
  }

  return (
    <Canvas
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
    >
      <PaintPlane />
      <NetworkLayer />
    </Canvas>
  );
}
