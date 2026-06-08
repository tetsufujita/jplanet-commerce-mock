"use client";

import { MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useReducedMotion } from "@/components/cinematic/MotionGate";

export type CinematicChapter = {
  selector: string;
  anchor?: number;
  color: string;
  accent: string;
  mood?: number;
};

type Props = {
  chapters: CinematicChapter[];
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform vec2 uCursor;
  uniform vec2 uCursorVelocity;
  uniform float uTime;
  uniform float uScrollVelocity;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform vec3 uSecondary;
  uniform float uMood;

  varying vec2 vUv;

  // Hash
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  // Value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // FBM with rotation per octave for organic look
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p = rot * p * 2.02;
      a *= 0.5;
    }
    return v;
  }

  // Watercolor blob: soft circular field with noise edge
  float blob(vec2 uv, vec2 center, float radius, float noiseSeed) {
    vec2 d = uv - center;
    float dist = length(d);
    float n = fbm(d * 4.0 + noiseSeed) * 0.2;
    return smoothstep(radius + n, radius * 0.4, dist);
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 centered = (uv - 0.5) * aspect;

    // ----- Base canvas: deep wash of base color -----
    vec3 color = uColor;

    // Big drifting paint clouds (watercolor blobs)
    float t = uTime * 0.05;
    float blob1 = blob(uv * aspect, vec2(0.3 + sin(t) * 0.1, 0.4 + cos(t * 0.7) * 0.1) * aspect, 0.45, 1.0);
    float blob2 = blob(uv * aspect, vec2(0.7 + cos(t * 0.8) * 0.12, 0.6 + sin(t * 0.5) * 0.08) * aspect, 0.4, 5.5);
    float blob3 = blob(uv * aspect, vec2(0.5 + sin(t * 0.4 + 1.3) * 0.15, 0.3 + cos(t * 0.6 + 2.1) * 0.1) * aspect, 0.35, 9.7);

    color = mix(color, uAccent, blob1 * 0.35 * (0.5 + uMood * 0.5));
    color = mix(color, uSecondary, blob2 * 0.28);
    color = mix(color, mix(uAccent, uSecondary, 0.5), blob3 * 0.22);

    // ----- Painterly micro-detail (brush strokes via stretched FBM) -----
    vec2 brushP = uv * vec2(8.0, 18.0) + vec2(uTime * 0.04, 0.0);
    float brush = fbm(brushP) * 0.08;
    color += vec3(brush) * (uMood * 0.6 + 0.4);

    // ----- Cursor radiating light (Lusion signature) -----
    vec2 cursorPos = (uCursor - 0.5) * aspect;
    vec2 cursorDelta = centered - cursorPos;
    float cursorDist = length(cursorDelta);
    float cursorGlow = exp(-cursorDist * 2.4);
    vec3 glowColor = uAccent + vec3(0.18);
    color += glowColor * cursorGlow * 0.45;

    // Cursor velocity trail
    float velocityMag = length(uCursorVelocity);
    if (velocityMag > 0.001) {
      vec2 velDir = normalize(uCursorVelocity);
      float trailProj = dot(cursorDelta, -velDir);
      float trail = exp(-cursorDist * 3.5) * max(0.0, trailProj * 2.5);
      color += uAccent * trail * 0.55 * min(velocityMag * 8.0, 1.0);
    }

    // ----- Wet paint sparkles (Lusion / Active Theory) -----
    vec2 sparkleP = uv * 18.0;
    float sp = hash21(floor(sparkleP) + floor(uTime * 0.5));
    if (sp > 0.992) {
      float sparkle = exp(-length(fract(sparkleP) - 0.5) * 30.0);
      color += vec3(sparkle) * uAccent * 1.4;
    }

    // ----- Top light leak (Active Theory) -----
    float topLeak = pow(1.0 - uv.y, 2.5) * 0.16;
    vec2 leakP = vec2(uv.x * 4.5 + uTime * 0.06, uTime * 0.04);
    topLeak *= 0.6 + noise(leakP) * 0.7;
    color += uAccent * topLeak;

    // ----- Bottom horizon glow -----
    float bottomGlow = pow(uv.y, 3.5) * 0.08;
    color += uSecondary * bottomGlow;

    // ----- Andes mountain silhouette (Brazil / LATAM motif) -----
    // Two layered ridges drawn at the bottom of viewport with parallax depth.
    float ridgeBack = fbm(vec2(uv.x * 3.2 + 5.3, 0.0)) * 0.10 + 0.13;
    float ridgeFront = fbm(vec2(uv.x * 5.8 + 17.7, 0.0)) * 0.07 + 0.07;

    // Back ridge (slightly desaturated, further away)
    float backMask = smoothstep(ridgeBack + 0.008, ridgeBack - 0.008, uv.y);
    vec3 backTint = mix(uColor, uAccent, 0.18) * 0.55;
    color = mix(color, backTint, backMask * 0.85);

    // Front ridge (darker silhouette)
    float frontMask = smoothstep(ridgeFront + 0.006, ridgeFront - 0.006, uv.y);
    vec3 frontTint = uColor * 0.25;
    color = mix(color, frontTint, frontMask);

    // Subtle sun / horizon glow above the ridges
    float ridgeHorizon = exp(-abs(uv.y - (ridgeBack + 0.02)) * 32.0);
    color += uAccent * ridgeHorizon * 0.28;

    // ----- Chromatic aberration (edges) -----
    float edge = pow(length((uv - 0.5) * 2.0), 2.2);
    color.r += edge * 0.035 * uAccent.r;
    color.b += edge * 0.025;
    color.g -= edge * 0.012;

    // ----- Vignette -----
    float vignette = smoothstep(1.25, 0.3, length((uv - 0.5) * 1.3));
    color *= mix(0.55, 1.0, vignette);

    // ----- Film grain -----
    vec2 grainP = uv * uResolution + uTime * 19.0;
    float grain = (hash21(grainP) - 0.5) * 0.04;
    color += vec3(grain);

    // ----- Scroll velocity smear -----
    if (abs(uScrollVelocity) > 0.001) {
      float smear = sin(uv.y * 28.0 + uTime * 3.5) * uScrollVelocity * 0.018;
      color += vec3(smear);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

type Resolved = {
  anchor: number;
  accent: THREE.Color;
  color: THREE.Color;
  element: HTMLElement;
  mood: number;
};

function parseColor(value: string) {
  return new THREE.Color(value);
}

function ShaderBackdrop({ chapters }: { chapters: CinematicChapter[] }) {
  const { size, viewport } = useThree();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const reducedMotion = useReducedMotion();
  const resolvedRef = useRef<Resolved[]>([]);
  const cursorTargetRef = useRef(new THREE.Vector2(0.5, 0.5));
  const cursorRef = useRef(new THREE.Vector2(0.5, 0.5));
  const cursorVelocityRef = useRef(new THREE.Vector2());
  const lastScrollRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const currentMoodRef = useRef(0.5);
  const currentColorsRef = useRef({ accent: new THREE.Color("#FF8A3C"), color: new THREE.Color("#060B1F"), secondary: new THREE.Color("#E4B870") });

  const uniforms = useMemo(
    () => ({
      uAccent: { value: new THREE.Color("#FF8A3C") },
      uColor: { value: new THREE.Color("#060B1F") },
      uCursor: { value: new THREE.Vector2(0.5, 0.5) },
      uCursorVelocity: { value: new THREE.Vector2() },
      uMood: { value: 0.5 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uScrollVelocity: { value: 0 },
      uSecondary: { value: new THREE.Color("#E4B870") },
      uTime: { value: 0 },
    }),
    [size.width, size.height],
  );

  useEffect(() => {
    const resolved: Resolved[] = chapters
      .map((ch) => {
        const element = document.querySelector<HTMLElement>(ch.selector);
        if (!element) return null;
        return {
          anchor: ch.anchor ?? 0.5,
          accent: parseColor(ch.accent),
          color: parseColor(ch.color),
          element,
          mood: ch.mood ?? 0.5,
        };
      })
      .filter((entry): entry is Resolved => entry !== null);
    resolvedRef.current = resolved;
  }, [chapters]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = 1 - event.clientY / window.innerHeight;
      cursorTargetRef.current.set(x, y);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useFrame((_state, delta) => {
    const mat = matRef.current;
    if (!mat) return;

    const u = mat.uniforms as Record<string, { value: unknown }>;
    const dt = Math.min(delta, 0.05);

    (u.uTime as { value: number }).value += dt;
    (u.uResolution as { value: THREE.Vector2 }).value.set(size.width, size.height);

    // Cursor smoothing
    const prevCursor = cursorRef.current.clone();
    cursorRef.current.lerp(cursorTargetRef.current, Math.min(dt * 6, 1));
    cursorVelocityRef.current.subVectors(cursorRef.current, prevCursor).multiplyScalar(60);
    (u.uCursor as { value: THREE.Vector2 }).value.copy(cursorRef.current);
    (u.uCursorVelocity as { value: THREE.Vector2 }).value.lerp(cursorVelocityRef.current, 0.4);

    // Scroll velocity
    const currentScroll = window.scrollY;
    const scrollDelta = currentScroll - lastScrollRef.current;
    lastScrollRef.current = currentScroll;
    scrollVelocityRef.current = scrollVelocityRef.current * 0.85 + scrollDelta * 0.015;
    (u.uScrollVelocity as { value: number }).value = scrollVelocityRef.current;

    // Determine current chapter
    const resolved = resolvedRef.current;
    if (resolved.length === 0) return;

    const viewportCenter = currentScroll + window.innerHeight / 2;
    const anchors = resolved.map((r) => {
      const rect = r.element.getBoundingClientRect();
      const top = currentScroll + rect.top;
      return { ...r, scrollY: top + r.element.offsetHeight * r.anchor };
    });

    let fromIndex = 0;
    let toIndex = 0;
    for (let i = 0; i < anchors.length - 1; i += 1) {
      const a = anchors[i];
      const b = anchors[i + 1];
      if (!a || !b) continue;
      if (viewportCenter >= a.scrollY && viewportCenter < b.scrollY) {
        fromIndex = i;
        toIndex = i + 1;
        break;
      } else if (viewportCenter >= b.scrollY) {
        fromIndex = i + 1;
        toIndex = i + 1;
      }
    }

    const from = anchors[fromIndex];
    const to = anchors[toIndex];
    if (!from || !to) return;

    let progress = 0;
    if (fromIndex !== toIndex && to.scrollY > from.scrollY) {
      progress = (viewportCenter - from.scrollY) / (to.scrollY - from.scrollY);
      progress = Math.max(0, Math.min(1, progress));
    }

    const targetColor = from.color.clone().lerp(to.color, progress);
    const targetAccent = from.accent.clone().lerp(to.accent, progress);
    // Secondary = "between" color creating depth
    const targetSecondary = from.accent.clone().lerp(to.color, 0.5).lerp(to.accent, progress * 0.3);
    const targetMood = from.mood * (1 - progress) + to.mood * progress;

    const lerpFactor = reducedMotion ? 1 : Math.min(dt * 3, 1);
    currentColorsRef.current.color.lerp(targetColor, lerpFactor);
    currentColorsRef.current.accent.lerp(targetAccent, lerpFactor);
    currentColorsRef.current.secondary.lerp(targetSecondary, lerpFactor);
    currentMoodRef.current = THREE.MathUtils.lerp(currentMoodRef.current, targetMood, lerpFactor);

    (u.uColor as { value: THREE.Color }).value.copy(currentColorsRef.current.color);
    (u.uAccent as { value: THREE.Color }).value.copy(currentColorsRef.current.accent);
    (u.uSecondary as { value: THREE.Color }).value.copy(currentColorsRef.current.secondary);
    (u.uMood as { value: number }).value = currentMoodRef.current;
  });

  return (
    <mesh position={[0, 0, -8]}>
      <planeGeometry args={[viewport.width * 4, viewport.height * 4]} />
      <shaderMaterial
        depthTest={false}
        depthWrite={false}
        fragmentShader={fragmentShader}
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}

function GlassFocal({ chapters }: { chapters: CinematicChapter[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();
  const accentRef = useRef(new THREE.Color("#FF8A3C"));
  const targetAccentRef = useRef(new THREE.Color("#FF8A3C"));
  const targetPositionRef = useRef(new THREE.Vector3(2.2, 0, 0));
  const targetScaleRef = useRef(1);
  const resolvedRef = useRef<{ anchor: number; accent: THREE.Color; element: HTMLElement; index: number }[]>([]);

  useEffect(() => {
    const resolved = chapters
      .map((ch, index) => {
        const element = document.querySelector<HTMLElement>(ch.selector);
        if (!element) return null;
        return {
          anchor: ch.anchor ?? 0.5,
          accent: parseColor(ch.accent),
          element,
          index,
        };
      })
      .filter((entry): entry is { anchor: number; accent: THREE.Color; element: HTMLElement; index: number } => entry !== null);
    resolvedRef.current = resolved;
  }, [chapters]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;
    const dt = Math.min(delta, 0.05);

    // Continuous rotation
    if (!reducedMotion) {
      group.rotation.x += dt * 0.12;
      group.rotation.y += dt * 0.18;
      group.rotation.z += dt * 0.05;
      // Subtle floating
      group.position.y = targetPositionRef.current.y + Math.sin(state.clock.elapsedTime * 0.6) * 0.2;
    }

    // Determine chapter progress
    const resolved = resolvedRef.current;
    if (resolved.length === 0) return;
    const currentScroll = window.scrollY;
    const viewportCenter = currentScroll + window.innerHeight / 2;
    const anchors = resolved.map((r) => {
      const rect = r.element.getBoundingClientRect();
      const top = currentScroll + rect.top;
      return { ...r, scrollY: top + r.element.offsetHeight * r.anchor };
    });

    let fromIndex = 0;
    let toIndex = 0;
    for (let i = 0; i < anchors.length - 1; i += 1) {
      const a = anchors[i];
      const b = anchors[i + 1];
      if (!a || !b) continue;
      if (viewportCenter >= a.scrollY && viewportCenter < b.scrollY) {
        fromIndex = i;
        toIndex = i + 1;
        break;
      } else if (viewportCenter >= b.scrollY) {
        fromIndex = i + 1;
        toIndex = i + 1;
      }
    }

    const from = anchors[fromIndex];
    const to = anchors[toIndex];
    if (!from || !to) return;

    let progress = 0;
    if (fromIndex !== toIndex && to.scrollY > from.scrollY) {
      progress = (viewportCenter - from.scrollY) / (to.scrollY - from.scrollY);
      progress = Math.max(0, Math.min(1, progress));
    }

    targetAccentRef.current.copy(from.accent).lerp(to.accent, progress);

    // Position drift across chapters (zig-zag through screen)
    const totalIndex = fromIndex + progress;
    const wave = totalIndex / Math.max(1, resolved.length - 1);
    targetPositionRef.current.x = Math.cos(wave * Math.PI * 2.5) * 2.4;
    targetPositionRef.current.z = Math.sin(wave * Math.PI * 1.5) * 0.6;
    targetScaleRef.current = 1 + Math.sin(wave * Math.PI * 1.8) * 0.18;

    accentRef.current.lerp(targetAccentRef.current, Math.min(dt * 3, 1));

    // Smooth position
    group.position.x += (targetPositionRef.current.x - group.position.x) * Math.min(dt * 2, 1);
    group.position.z += (targetPositionRef.current.z - group.position.z) * Math.min(dt * 2, 1);
    const targetScale = targetScaleRef.current;
    const currentScale = group.scale.x;
    const nextScale = currentScale + (targetScale - currentScale) * Math.min(dt * 2, 1);
    group.scale.setScalar(nextScale);

    // Set transmission material color
    const mat = mesh.material as THREE.MeshPhysicalMaterial & { color: THREE.Color };
    if (mat && mat.color) {
      mat.color.copy(accentRef.current);
    }
  });

  return (
    <group ref={groupRef} position={[2.2, 0, 0]}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[0.85, 0.28, 192, 24]} />
        <MeshTransmissionMaterial
          anisotropicBlur={0.4}
          backside
          backsideThickness={1.2}
          chromaticAberration={0.55}
          color="#FF8A3C"
          distortion={0.4}
          distortionScale={0.3}
          ior={1.45}
          samples={4}
          temporalDistortion={0.15}
          thickness={1.8}
          transmission={0.95}
        />
      </mesh>
    </group>
  );
}

function AgentNetwork() {
  const reducedMotion = useReducedMotion();
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, linePositions } = useMemo(() => {
    const count = 180;
    const positionsArray = new Float32Array(count * 3);
    const points: THREE.Vector3[] = [];

    for (let i = 0; i < count; i += 1) {
      // Distribute across a wide volume but pull center cluster denser
      const cluster = Math.random() < 0.55;
      const range = cluster ? 4.5 : 9;
      const x = (Math.random() - 0.5) * range;
      const y = (Math.random() - 0.5) * (range * 0.6);
      const z = (Math.random() - 0.5) * range * 0.5;

      positionsArray[i * 3] = x;
      positionsArray[i * 3 + 1] = y;
      positionsArray[i * 3 + 2] = z;
      points.push(new THREE.Vector3(x, y, z));
    }

    // Build sparse adjacency: connect each point to its 2 nearest neighbors if within radius
    const lineSegments: number[] = [];
    const maxDist = 1.6;

    points.forEach((p, i) => {
      const distances = points
        .map((q, j) => ({ idx: j, d: i === j ? Infinity : p.distanceTo(q) }))
        .filter((entry) => entry.d <= maxDist)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);

      distances.forEach(({ idx }) => {
        if (idx <= i) {
          return;
        }
        const q = points[idx];
        if (!q) return;
        lineSegments.push(p.x, p.y, p.z, q.x, q.y, q.z);
      });
    });

    return {
      linePositions: new Float32Array(lineSegments),
      positions: positionsArray,
    };
  }, []);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.elapsedTime;

    if (pointsRef.current) {
      pointsRef.current.rotation.y += dt * 0.04;
      pointsRef.current.rotation.x = Math.sin(elapsed * 0.1) * 0.08;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y += dt * 0.04;
      linesRef.current.rotation.x = Math.sin(elapsed * 0.1) * 0.08;
      (linesRef.current.material as THREE.LineBasicMaterial).opacity =
        0.12 + (Math.sin(elapsed * 0.6) + 1) * 0.05;
    }
  });

  return (
    <group position={[0, 0, -2]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            args={[positions, 3]}
            attach="attributes-position"
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          depthWrite={false}
          opacity={0.85}
          size={0.04}
          sizeAttenuation
          transparent
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            args={[linePositions, 3]}
            attach="attributes-position"
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" depthWrite={false} opacity={0.18} transparent />
      </lineSegments>
    </group>
  );
}

function CameraDolly() {
  const { camera } = useThree();
  const reducedMotion = useReducedMotion();
  const baseZ = 5;
  const targetRef = useRef({ x: 0, y: 0, z: baseZ });

  useFrame((_state, delta) => {
    if (reducedMotion) return;
    const dt = Math.min(delta, 0.05);
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const t = Math.min(1, Math.max(0, window.scrollY / max));

    targetRef.current.z = baseZ + Math.sin(t * Math.PI) * 1.6;
    targetRef.current.x = Math.sin(t * Math.PI * 2.5) * 0.7;
    targetRef.current.y = Math.cos(t * Math.PI * 1.5) * 0.35;

    camera.position.x += (targetRef.current.x - camera.position.x) * Math.min(dt * 1.8, 1);
    camera.position.y += (targetRef.current.y - camera.position.y) * Math.min(dt * 1.8, 1);
    camera.position.z += (targetRef.current.z - camera.position.z) * Math.min(dt * 1.8, 1);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function CinematicCanvasClaude({ chapters }: Props) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `linear-gradient(180deg, ${chapters[0]?.color ?? "#060B1F"}, ${
            chapters[chapters.length - 1]?.color ?? "#FAFAF7"
          })`,
        }}
      />
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 50, position: [0, 0, 5] }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} />
        <directionalLight position={[-4, -2, 3]} intensity={0.7} />
        <CameraDolly />
        <ShaderBackdrop chapters={chapters} />
        <AgentNetwork />
        <Sparkles
          color="#ffffff"
          count={140}
          opacity={0.7}
          scale={[14, 8, 6] as unknown as number}
          size={2}
          speed={0.3}
        />
      </Canvas>
    </div>
  );
}
