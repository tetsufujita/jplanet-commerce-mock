"use client";

import { interpolate, spring } from "remotion";

/**
 * Revolut-style 3-scene cycle. Each scene has its own background photo +
 * its own WhatsApp conversation rendered as a centered glass card. Bg
 * crossfades between scenes; the card content swaps in lockstep.
 *
 * Total loop: 540 frames @ 30fps = 18s (3 scenes × 6s).
 *
 * Scene timing (180 frames each):
 *   0–20    bg crossfade in / card scale-in
 *   20–60   header + msg1
 *   60–110  msg2
 *   110–150 product card + msg3
 *   150–180 confirm + bg crossfade out
 */

type Scene = {
  bg: string;
  conversation: {
    user1: string;
    assistant1: string;
    product: { name: string; sub: string; price: string };
    user2: string;
    confirm: string;
  };
  agentLabel: string; // small badge in header
};

const SCENES: Scene[] = [
  {
    bg: "/images/whatsapp-bg.jpg",
    agentLabel: "ChatGPT · Agentic",
    conversation: {
      user1: "Eu gostaria do Hada Labo Gokujyun. Vocês têm?",
      assistant1: "Sim, temos sim 😊 160ml por R$ 189.",
      product: { name: "Hada Labo Gokujyun", sub: "160ml · J-Planet", price: "R$ 189,00" },
      user2: "Vou ficar com esta opção 👍",
      confirm: "Pedido confirmado · entrega 4-7 dias",
    },
  },
  {
    bg: "/images/whatsapp-bg-2.jpg",
    agentLabel: "Claude · Agentic",
    conversation: {
      user1: "Tem creme facial coreano? Pele sensível.",
      assistant1: "Sim! Innisfree Green Tea Cream para pele sensível.",
      product: { name: "Innisfree Green Tea Cream", sub: "50ml · J-Planet", price: "R$ 145,00" },
      user2: "Perfeito, vou levar 2.",
      confirm: "Pedido confirmado · entrega 4-7 dias",
    },
  },
  {
    bg: "/images/whatsapp-bg-3.jpg",
    agentLabel: "Google AI · Agentic",
    conversation: {
      user1: "Procuro vitamina japonesa para imunidade.",
      assistant1: "DHC Multivitamin 60 dias, R$ 78.",
      product: { name: "DHC Multivitamin", sub: "60 dias · J-Planet", price: "R$ 78,00" },
      user2: "Ótimo, adiciona ao pedido.",
      confirm: "Pedido confirmado · entrega 4-7 dias",
    },
  },
];

const SCENE_FRAMES = 180;
const TOTAL = SCENES.length * SCENE_FRAMES;

type Props = {
  frame: number;
  width?: number;
  height?: number;
};

export function AgenticChatComposition({ frame, width = 800, height = 1000 }: Props) {
  const fps = 30;
  const wrapped = ((frame % TOTAL) + TOTAL) % TOTAL;
  const sceneIndex = Math.floor(wrapped / SCENE_FRAMES);
  const local = wrapped - sceneIndex * SCENE_FRAMES;
  const scene = SCENES[sceneIndex]!;
  const nextScene = SCENES[(sceneIndex + 1) % SCENES.length]!;

  const phase = (start: number, end: number) =>
    interpolate(local, [start, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Card scale-in at the start, fade-out at the end of the scene
  const cardIn = phase(0, 25);
  const cardOut = phase(160, 180);
  const cardOpacity = cardIn * (1 - cardOut * 0.4);

  const headerIn = phase(15, 40);
  const msg1 = spring({ frame: Math.max(0, local - 30), fps, config: { damping: 14, mass: 0.5, stiffness: 130 } });
  const msg2 = spring({ frame: Math.max(0, local - 65), fps, config: { damping: 14, mass: 0.5, stiffness: 130 } });
  const productSpring = spring({ frame: Math.max(0, local - 100), fps, config: { damping: 14, mass: 0.5, stiffness: 130 } });
  const msg3 = spring({ frame: Math.max(0, local - 130), fps, config: { damping: 14, mass: 0.5, stiffness: 130 } });
  const confirm = spring({ frame: Math.max(0, local - 160), fps, config: { damping: 14, mass: 0.55, stiffness: 130 } });

  // Bg crossfade — the active bg is full opacity for the bulk of the scene,
  // then fades out in the last 30 frames as next scene fades in.
  const bgFade = phase(150, 180);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        width: "100%",
        height: "100%",
        background: "#0a1a14",
      }}
    >
      {/* Current bg */}
      <img
        alt=""
        draggable={false}
        src={scene.bg}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 1 - bgFade,
          transform: `scale(${1.03 + (local / SCENE_FRAMES) * 0.04})`,
          transition: "none",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
      {/* Next bg, fading in for seamless transition */}
      <img
        alt=""
        draggable={false}
        src={nextScene.bg}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: bgFade,
          transform: `scale(${1.0 + bgFade * 0.03})`,
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
      {/* Dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,28,28,0.45) 0%, rgba(10,28,28,0.15) 35%, rgba(10,28,28,0.62) 100%)",
        }}
      />

      {/* Center glass card */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "min(72%, 460px)",
          transform: `translate(-50%, -50%) translateY(${(1 - cardIn) * 24}px) scale(${0.94 + cardIn * 0.06})`,
          opacity: cardOpacity,
          background: "rgba(8,14,18,0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 26,
          boxShadow: "0 40px 80px rgba(0,0,0,0.55)",
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingBottom: 14,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            opacity: headerIn,
            transform: `translateY(${(1 - headerIn) * -8}px)`,
          }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#25D366",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            J
          </span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>J-Planet</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>WhatsApp · online</span>
          </div>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(122,224,181,0.92)",
            }}
          >
            {scene.agentLabel}
          </span>
        </div>

        {/* User msg 1 */}
        <Bubble role="user" opacity={msg1}>
          {scene.conversation.user1}
        </Bubble>

        {/* Assistant msg */}
        <Bubble role="assistant" opacity={msg2}>
          {scene.conversation.assistant1}
        </Bubble>

        {/* Product card */}
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "92%",
            background: "rgba(255,255,255,0.96)",
            color: "#0A1428",
            padding: 10,
            borderRadius: 14,
            display: "flex",
            gap: 12,
            opacity: productSpring,
            transform: `translateY(${(1 - productSpring) * 10}px) scale(${0.96 + productSpring * 0.04})`,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: "#e8eee8",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              alt=""
              draggable={false}
              src="/images/hada-labo-bottle.png"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11 }}>
            <span style={{ fontWeight: 600 }}>{scene.conversation.product.name}</span>
            <span style={{ opacity: 0.65 }}>{scene.conversation.product.sub}</span>
            <span style={{ marginTop: 2, fontWeight: 700, color: "#1F8E4A", fontSize: 12 }}>
              {scene.conversation.product.price}
            </span>
          </div>
        </div>

        {/* User msg 2 */}
        <Bubble role="user" opacity={msg3}>
          {scene.conversation.user2}
        </Bubble>

        {/* Confirm */}
        <div
          style={{
            marginTop: 4,
            background: "linear-gradient(135deg, rgba(122,224,181,0.92), rgba(91,199,154,0.92))",
            color: "#062317",
            padding: "12px 14px",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 12,
            fontWeight: 700,
            opacity: confirm,
            transform: `translateY(${(1 - confirm) * 10}px) scale(${0.96 + confirm * 0.04})`,
          }}
        >
          <CheckMark size={18} color="#062317" />
          {scene.conversation.confirm}
        </div>
      </div>

      {/* Scene indicator dots (bottom center) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 24,
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
        }}
      >
        {SCENES.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === sceneIndex ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: i === sceneIndex ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.35)",
              transition: "none",
            }}
          />
        ))}
      </div>

      <span style={{ display: "none" }}>{width}x{height}</span>
    </div>
  );
}

function Bubble({
  children,
  opacity,
  role,
}: {
  children: React.ReactNode;
  opacity: number;
  role: "user" | "assistant";
}) {
  const isUser = role === "user";
  return (
    <div
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "82%",
        background: isUser ? "#1F3D33" : "rgba(255,255,255,0.96)",
        color: isUser ? "#fff" : "#0A1428",
        padding: "10px 13px",
        borderRadius: 16,
        fontSize: 13,
        lineHeight: 1.5,
        opacity,
        transform: `translateY(${(1 - opacity) * 8}px)`,
      }}
    >
      {children}
    </div>
  );
}

function CheckMark({ size = 16, color = "#7AE0B5" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill={`${color}26`} />
      <path d="M7 12.5L10.5 16L17 9" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
