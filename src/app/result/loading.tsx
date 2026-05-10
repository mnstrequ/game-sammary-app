import { Gamepad2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="relative flex flex-col items-center justify-center space-y-6">
        <div className="absolute w-32 h-32 border-4 border-primary/30 rounded-full animate-ping"></div>
        <div className="absolute w-24 h-24 border-4 border-primary rounded-full animate-[spin_3s_linear_infinite] border-t-transparent"></div>
        <Gamepad2 className="w-12 h-12 text-primary animate-pulse neon-glow relative z-10" />
        <p className="text-xl font-bold tracking-widest text-primary animate-pulse relative z-10">
          LOADING...
        </p>
        <p className="text-sm text-muted-foreground animate-pulse">
          AIがデータベースにアクセスしています
        </p>
      </div>
    </div>
  );
}
