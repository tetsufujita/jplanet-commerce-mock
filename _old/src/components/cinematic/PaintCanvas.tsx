"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { useReducedMotion } from "@/components/cinematic/MotionGate";

const MAX_STROKES = 12;

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const brushFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform vec2 uStrokes[12];
  uniform float uAges[12];
  varying vec2 vUv;

  void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = vUv * aspect;
    float alpha = 0.0;

    for (int i = 0; i < 12; i++) {
      float age = uAges[i];
      vec2 stroke = uStrokes[i] * aspect;
      float radius = 80.0 / min(uResolution.x, uResolution.y);
      float mark = smoothstep(radius, 0.0, distance(uv, stroke));
      alpha += mark * max(0.0, 1.0 - age / 1.5) * 0.04;
    }

    gl_FragColor = vec4(vec3(1.0), min(alpha, 0.09));
  }
`;

function getModeOpacity(mode: "network" | "paint") {
  const section = document.querySelector(`[data-webgl-mode="${mode}"]`);

  if (!(section instanceof HTMLElement)) {
    return 0;
  }

  const rect = section.getBoundingClientRect();
  const viewport = window.innerHeight;

  if (rect.bottom < 0 || rect.top > viewport) {
    return 0;
  }

  const center = viewport * 0.5;
  const distance = Math.min(Math.abs(rect.top - center), Math.abs(rect.bottom - center));

  return Math.max(0, Math.min(1, 1 - distance / viewport));
}

function readCssColor(tokenName: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
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

function BrushPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const strokesRef = useRef<Array<{ age: number; point: THREE.Vector2 }>>([]);
  const lastStrokeAtRef = useRef(0);
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uStrokes: {
        value: Array.from({ length: MAX_STROKES }, () => new THREE.Vector2(-10, -10)),
      },
      uAges: { value: new Float32Array(MAX_STROKES).fill(99) },
    }),
    [size.height, size.width],
  );

  useEffect(() => {
    const addStroke = (event: PointerEvent) => {
      const now = performance.now();

      if (now - lastStrokeAtRef.current < 72) {
        return;
      }

      lastStrokeAtRef.current = now;
      strokesRef.current.push({
        age: 0,
        point: new THREE.Vector2(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight),
      });
      strokesRef.current = strokesRef.current.slice(-MAX_STROKES);
    };

    window.addEventListener("pointermove", addStroke, { passive: true });

    return () => window.removeEventListener("pointermove", addStroke);
  }, []);

  useFrame((_, delta) => {
    const opacity = getModeOpacity("paint");

    strokesRef.current = strokesRef.current
      .map((stroke) => ({ ...stroke, age: stroke.age + delta }))
      .filter((stroke) => stroke.age <= 1.5);

    uniforms.uResolution.value.set(size.width, size.height);

    for (let index = 0; index < MAX_STROKES; index += 1) {
      const stroke = strokesRef.current[index];
      uniforms.uStrokes.value[index]?.set(stroke?.point.x ?? -10, stroke?.point.y ?? -10);
      uniforms.uAges.value[index] = stroke ? stroke.age + (1 - opacity) * 1.5 : 99;
    }

    if (materialRef.current) {
      materialRef.current.visible = opacity > 0.02;
    }
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={brushFragmentShader}
        transparent
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

  useEffect(() => {
    const color = readCssColor("--color-andes-teal");

    if (color && lineMaterialRef.current) {
      lineMaterialRef.current.color.set(color);
    }

    if (color && pointMaterialRef.current) {
      pointMaterialRef.current.color.set(color);
    }
  }, []);

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
        <lineBasicMaterial ref={lineMaterialRef} transparent color="white" opacity={0} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pointPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={pointMaterialRef}
          transparent
          color="white"
          depthWrite={false}
          opacity={0}
          size={0.12}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export function PaintCanvas() {
  const shouldRenderWebGL = useShouldRenderWebGL();

  if (!shouldRenderWebGL) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        className="h-full w-full"
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        style={{ inset: 0, position: "absolute" }}
      >
        <BrushPlane />
        <NetworkLayer />
      </Canvas>
    </div>
  );
}
