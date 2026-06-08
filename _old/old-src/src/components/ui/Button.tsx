import type { ButtonHTMLAttributes } from "react";

import { cx } from "@/lib/classnames";

type ButtonVariant = "primary" | "crimson" | "secondary" | "ghost" | "paper";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-andes-navy text-andes-paper hover:bg-andes-deep focus-visible:outline-andes-crimson",
  crimson:
    "bg-andes-crimson text-andes-paper hover:bg-andes-glow focus-visible:outline-andes-navy",
  secondary:
    "border border-andes-navy/25 text-andes-navy hover:border-andes-navy hover:bg-gray-50 focus-visible:outline-andes-crimson",
  ghost:
    "text-andes-navy hover:bg-gray-50 focus-visible:outline-andes-crimson",
  paper:
    "border border-andes-paper/35 text-andes-paper hover:bg-andes-paper/10 focus-visible:outline-andes-paper",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  className?: string,
): string {
  return cx(
    "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold transition duration-300 ease-andes focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return <button className={buttonClassName(variant, className)} type={type} {...props} />;
}
