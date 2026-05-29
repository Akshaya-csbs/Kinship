import { ReactNode } from "react";

interface GradientBackgroundProps {
  children: ReactNode;
  variant?: "default" | "purple" | "blue";
}

export function GradientBackground({ children, variant = "default" }: GradientBackgroundProps) {
  const gradients = {
    default: "from-[#0a0a0f] via-[#131318] to-[#0a0a0f]",
    purple: "from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]",
    blue: "from-[#0a0a0f] via-[#0f1a2e] to-[#0a0a0f]",
  };

  return (
    <div className={`relative bg-gradient-to-br ${gradients[variant]}`}>
      {children}
    </div>
  );
}
