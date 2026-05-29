import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileContainer({ children, className = "" }: MobileContainerProps) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className={`w-full max-w-md min-h-screen bg-background relative ${className}`}>
        {children}
      </div>
    </div>
  );
}
