"use client";

import { useSearchParams } from "next/navigation";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, AlertTriangle, Columns } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CompareView() {
  const searchParams = useSearchParams();
  const titles = searchParams.getAll("title");
  const { bookmarks } = useBookmarks();

  if (titles.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">比較するゲームが不足しています</h2>
        <p className="text-muted-foreground">お気に入り一覧から、比較したいゲームを2つ以上選択してください。</p>
        <Link href="/bookmarks">
          <Button>お気に入り一覧へ戻る</Button>
        </Link>
      </div>
    );
  }

  // Find games in bookmarks matching the titles
  const gamesToCompare = titles
    .map(title => bookmarks.find(b => b.title === title))
    .filter(Boolean) as typeof bookmarks;

  if (gamesToCompare.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <Gamepad2 className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">データが見つかりません</h2>
        <p className="text-muted-foreground">選択されたゲームのデータがローカルに見つかりませんでした。</p>
        <Link href="/bookmarks">
          <Button>お気に入り一覧へ戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-2 mb-8">
        <Columns className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">ゲーム比較</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {gamesToCompare.map((game, index) => (
          <Card key={index} className="flex flex-col h-full border-primary/20 bg-background/50 backdrop-blur">
            <CardHeader className="bg-primary/5 rounded-t-lg border-b border-primary/10">
              <CardTitle className="text-xl font-bold line-clamp-2 min-h-[3.5rem] flex items-center">
                {game.title}
              </CardTitle>
              <p className="text-sm text-primary font-medium">{game.genre}</p>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 pt-6">
              
              <div className="space-y-2">
                <h3 className="font-semibold border-b pb-2 text-foreground/80">クリア時間</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">メイン:</div>
                  <div className="font-medium text-right">{game.clear_time.main}</div>
                  <div className="text-muted-foreground">完全クリア:</div>
                  <div className="font-medium text-right">{game.clear_time.complete}</div>
                  {game.clear_time.dlc && game.clear_time.dlc !== "なし" && (
                    <>
                      <div className="text-muted-foreground">DLC:</div>
                      <div className="font-medium text-right">{game.clear_time.dlc}</div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold border-b pb-2 text-foreground/80">おすすめポイント</h3>
                <ul className="space-y-3 text-sm">
                  {game.recommend_points.slice(0, 3).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="leading-relaxed text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Link href={`/result?title=${encodeURIComponent(game.title)}`} className="w-full">
                <Button variant="outline" className="w-full">詳細を見る</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
