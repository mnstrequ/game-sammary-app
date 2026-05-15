import { Suspense } from "react";
import { CompareView } from "@/components/CompareView";
import { Gamepad2 } from "lucide-react";

export default function ComparePage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-7xl space-y-8">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <Gamepad2 className="w-12 h-12 text-primary animate-pulse" />
            <p>比較データを読み込み中...</p>
          </div>
        }>
          <CompareView />
        </Suspense>
      </div>
    </main>
  );
}
