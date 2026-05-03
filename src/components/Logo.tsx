import { Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 blur-md bg-primary/60 group-hover:bg-primary transition-colors rounded-full" />
        <Zap className="relative h-7 w-7 text-primary fill-primary" strokeWidth={2.5} />
      </div>
      <span className="font-display font-black text-xl tracking-wider">
        VOLTRON<span className="text-primary">TECH</span>
      </span>
    </Link>
  );
}
