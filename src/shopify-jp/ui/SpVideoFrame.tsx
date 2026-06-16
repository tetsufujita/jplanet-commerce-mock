import { useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * autoplay loop muted playsinline + 読込後 300ms フェードイン。
 * reduced-motion / src 未指定時は poster（または fallback gradient）を表示。
 */
export function SpVideoFrame({
  src,
  poster,
  fallbackClassName = "bg-[radial-gradient(80%_80%_at_50%_40%,#123034_0%,#02090a_100%)]",
  className = "",
}: {
  src?: string;
  poster?: string;
  fallbackClassName?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const showVideo = Boolean(src) && !reduced;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className={`absolute inset-0 ${fallbackClassName}`} />
      {poster ? (
        <img src={poster} alt="" className="absolute inset-0 size-full object-cover" />
      ) : null}
      {showVideo ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedData={() => { setLoaded(true); }}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );
}
