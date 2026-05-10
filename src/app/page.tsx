import { SearchForm } from "@/components/SearchForm";
import { Gamepad2 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background via-background to-primary/20 dark">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center justify-center space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10 neon-box">
            <Gamepad2 className="w-16 h-16 text-primary neon-glow" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            ゲーム詳解<span className="text-primary neon-glow">AI</span>事典
          </h1>
          <p className="text-lg text-muted-foreground max-w-[600px] mt-4">
            AIがあなたのお気に入りのゲームを徹底解説します。
            クリア時間、ストーリー、用語集まで、あらゆる情報を即座に生成。
          </p>
        </div>
        
        <SearchForm />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 text-sm text-muted-foreground">
          <div className="flex flex-col items-center p-4 border rounded-lg bg-background/50 backdrop-blur">
            <span className="font-bold text-foreground">クリア時間</span>
            <span>プレイボリュームを把握</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg bg-background/50 backdrop-blur">
            <span className="font-bold text-foreground">ストーリー解説</span>
            <span>ネタバレあり/なしを選択</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg bg-background/50 backdrop-blur">
            <span className="font-bold text-foreground">登場人物</span>
            <span>主要キャラクターの紹介</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg bg-background/50 backdrop-blur">
            <span className="font-bold text-foreground">用語集</span>
            <span>独自の世界観を理解</span>
          </div>
        </div>
      </div>
    </main>
  );
}
