"use client";

import { interpolate, spring } from "remotion";

/**
 * Shopify-style 7-phase loop (12s / 360 frames at 30fps).
 *
 *   0–60    A. Product hero floats in (large, soft glow)
 *   60–110  B. User chat bubble pops top-right ("Preciso…")
 *   90–160  C. Compact product card slides in below the bubble
 *   140–230 D. Phone scales up (containing the J-Planet WhatsApp screenshot)
 *           — the floating bottle + bubble + card fade as the phone takes over
 *   220–290 E. Phone settles, small product thumbs orbit it
 *   290–360 F. Constellation: "Obrigado, X!" cards + check marks pop around
 *           the phone in sequence
 */

const SCREENSHOT_SRC = "/images/jplanet-whatsapp.png";
const PRODUCT_SRC = "/images/hada-labo-bottle.png";

type Props = {
  frame: number;
  width?: number;
  height?: number;
};

export function AgenticChatComposition({ frame, width = 800, height = 1000 }: Props) {
  const fps = 30;

  const phase = (start: number, end: number) =>
    interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // A — product float
  const productIn = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 90 },
  });
  // Fade product down as phone takes over (140–200)
  const productOut = phase(150, 210);
  const productOpacity = productIn * (1 - productOut * 0.85);
  const productScale = 0.85 + productIn * 0.15 - productOut * 0.1;

  // B — user bubble
  const bubble = spring({
    frame: Math.max(0, frame - 60),
    fps,
    config: { damping: 16, mass: 0.5, stiffness: 130 },
  });
  const bubbleOut = phase(150, 200);
  const bubbleOpacity = bubble * (1 - bubbleOut);

  // C — compact product card
  const card = spring({
    frame: Math.max(0, frame - 90),
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 130 },
  });
  const cardOut = phase(150, 210);
  const cardOpacity = card * (1 - cardOut);

  // D — phone scale up
  const phone = spring({
    frame: Math.max(0, frame - 140),
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 110 },
  });

  // E — orbiting product thumbs (after phone is up)
  const orbit = phase(220, 290);
  // F — constellation thank-yous
  const constellation = phase(290, 360);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(120% 100% at 0% 0%, rgba(34,80,68,0.95) 0%, rgba(10,28,28,0.95) 60%, rgba(8,20,20,0.95) 100%)",
        overflow: "hidden",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(50% 40% at 80% 10%, rgba(122,224,181,0.18) 0%, rgba(10,28,28,0) 70%)," +
            "radial-gradient(40% 30% at 10% 90%, rgba(240,232,192,0.10) 0%, rgba(10,28,28,0) 70%)",
        }}
      />

      {/* A — Product hero float */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 360,
          height: 360,
          transform: `translate(-50%, -50%) scale(${productScale})`,
          opacity: productOpacity,
          filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.55))",
        }}
      >
        <img
          alt=""
          draggable={false}
          src={PRODUCT_SRC}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            mixBlendMode: "screen",
            opacity: 0.92,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* B — User bubble (top-right) */}
      <div
        style={{
          position: "absolute",
          top: "16%",
          right: "8%",
          maxWidth: 280,
          transform: `translateY(${(1 - bubble) * -10}px) scale(${0.9 + bubble * 0.1})`,
          opacity: bubbleOpacity,
          background: "rgba(255,255,255,0.96)",
          color: "#0A1428",
          padding: "12px 16px",
          borderRadius: 18,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
          lineHeight: 1.45,
          boxShadow: "0 14px 30px rgba(0,0,0,0.4)",
        }}
      >
        Preciso de um sérum hidratante japonês. Até R$ 200.
      </div>

      {/* C — Product card */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          right: "12%",
          width: 240,
          transform: `translateY(${(1 - card) * 14}px) scale(${0.9 + card * 0.1})`,
          opacity: cardOpacity,
          background: "rgba(255,255,255,0.98)",
          color: "#0A1428",
          padding: 12,
          borderRadius: 16,
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: 10,
            overflow: "hidden",
            background: "#e8eee8",
          }}
        >
          <img
            alt=""
            draggable={false}
            src={PRODUCT_SRC}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Hada Labo Gokujyun</span>
          <span style={{ fontSize: 11, color: "rgba(10,20,40,0.6)" }}>160ml · J-Planet</span>
          <span style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: "#1F8E4A" }}>
            R$ 189,00
          </span>
        </div>
      </div>

      {/* D — Phone scales up with full J-Planet WhatsApp screenshot */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 620,
          height: 620,
          transform: `translate(-50%, -50%) scale(${0.5 + phone * 0.55})`,
          opacity: phone * (1 - constellation * 0.15),
          filter: `drop-shadow(0 40px 70px rgba(0,0,0,0.6)) blur(${(1 - phone) * 6}px)`,
        }}
      >
        <img
          alt=""
          draggable={false}
          src={SCREENSHOT_SRC}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* E — orbiting product thumbs around the phone */}
      {[
        { x: 0.18, y: 0.22, label: "Hada Labo", delay: 0 },
        { x: 0.82, y: 0.22, label: "SHISEIDO", delay: 6 },
        { x: 0.18, y: 0.78, label: "DHC", delay: 12 },
        { x: 0.82, y: 0.78, label: "MUJI", delay: 18 },
      ].map((t, i) => {
        const localFrame = Math.max(0, frame - 220 - t.delay);
        const pop = spring({
          frame: localFrame,
          fps,
          config: { damping: 14, mass: 0.5, stiffness: 130 },
        });
        // Hide once constellation phase ramps in
        const visible = pop * (1 - constellation * 0.85);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${t.x * 100}%`,
              top: `${t.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${pop})`,
              opacity: visible,
              background: "rgba(255,255,255,0.96)",
              color: "#0A1428",
              padding: 8,
              borderRadius: 12,
              fontFamily: "system-ui, sans-serif",
              boxShadow: "0 14px 28px rgba(0,0,0,0.42)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              width: 110,
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 8,
                overflow: "hidden",
                background: "#e8eee8",
              }}
            >
              <img
                alt=""
                draggable={false}
                src={PRODUCT_SRC}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, textAlign: "center" }}>{t.label}</span>
          </div>
        );
      })}

      {/* F — Constellation thank-yous */}
      {[
        { x: 0.16, y: 0.3, name: "Camila", delay: 0 },
        { x: 0.86, y: 0.22, name: "João", delay: 4 },
        { x: 0.88, y: 0.68, name: "Maria", delay: 8 },
        { x: 0.14, y: 0.76, name: "Lucas", delay: 12 },
      ].map((t, i) => {
        const localFrame = Math.max(0, frame - 290 - t.delay);
        const pop = spring({
          frame: localFrame,
          fps,
          config: { damping: 12, mass: 0.5, stiffness: 130 },
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${t.x * 100}%`,
              top: `${t.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${pop})`,
              opacity: pop,
              background: "rgba(255,255,255,0.96)",
              color: "#0A1428",
              padding: "10px 14px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              boxShadow: "0 10px 24px rgba(0,0,0,0.45)",
            }}
          >
            <CheckMark size={18} />
            Obrigado, {t.name}!
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 100% at 50% 50%, rgba(10,28,28,0) 60%, rgba(10,28,28,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
      <span style={{ display: "none" }}>{width}x{height}</span>
    </div>
  );
}

function CheckMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="rgba(122,224,181,0.18)" />
      <path d="M7 12.5L10.5 16L17 9" stroke="#7AE0B5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
