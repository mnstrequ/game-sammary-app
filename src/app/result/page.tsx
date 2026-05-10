import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { generateGameInfo } from "@/app/actions/generateGameInfo";
import { GameResult } from "@/components/GameResult";
import Loading from "./loading";
import { Button } from "@/components/ui/button";

export const maxDuration = 60; // VercelのServerless Functionのタイムアウトを延長

export default async function ResultPage({
  searchParams,
}: {
  searchParams: { title?: string };
}) {
  const title = searchParams.title;

  if (!title) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <p className="text-xl">タイトルが指定されていません。</p>
        <Link href="/">
          <Button variant="outline">トップへ戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-5xl mb-8 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            トップへ戻る
          </Button>
        </Link>
      </div>
      
      <Suspense fallback={<Loading />}>
        <GameInfoLoader title={title} />
      </Suspense>
    </main>
  );
}

async function GameInfoLoader({ title }: { title: string }) {
  try {
    const data = await generateGameInfo(title);
    return <GameResult data={data} />;
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-destructive/10 border-destructive/20 text-center space-y-4 max-w-xl w-full">
        <p className="text-destructive font-bold text-lg">エラーが発生しました</p>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "ゲーム情報の生成に失敗しました。"}
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            トップへ戻る
          </Button>
        </Link>
      </div>
    );
  }
}
