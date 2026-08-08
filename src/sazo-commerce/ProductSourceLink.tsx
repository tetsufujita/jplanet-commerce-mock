import { ExternalLink } from "lucide-react";

export interface ProductSourceLinkProps {
  brand: string;
  href: string;
  label: string;
}

export function ProductSourceLink({ brand, href, label }: ProductSourceLinkProps) {
  const brandKey = brand
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return (
    <a className="sazo-product-source-link" href={href} rel="noreferrer" target="_blank">
      <span
        className="sazo-product-source-badge"
        data-brand={brandKey}
        data-testid="product-source-badge"
      >
        {brand}
      </span>
      <span className="sazo-product-source-label">{label}</span>
      <ExternalLink aria-hidden size={18} strokeWidth={1.9} />
    </a>
  );
}
