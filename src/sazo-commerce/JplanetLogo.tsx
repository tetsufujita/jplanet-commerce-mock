interface JplanetLogoProps {
  className?: string;
}

export function JplanetLogo({ className }: JplanetLogoProps) {
  return (
    <img
      alt=""
      aria-hidden
      className={className}
      data-jplanet-wordmark
      draggable={false}
      src="/sazo-commerce/jplanet-wordmark.png"
    />
  );
}
