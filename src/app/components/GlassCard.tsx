import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = "", onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
